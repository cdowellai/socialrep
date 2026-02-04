import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation
interface ValidationError {
  field: string;
  message: string;
}

function validateString(
  value: unknown,
  field: string,
  options: { required?: boolean; maxLength?: number } = {}
): ValidationError | null {
  const { required = false, maxLength } = options;

  if (value === undefined || value === null || value === "") {
    if (required) return { field, message: `${field} is required` };
    return null;
  }

  if (typeof value !== "string") {
    return { field, message: `${field} must be a string` };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }

  return null;
}

function validateArray(value: unknown, field: string, maxItems = 100): ValidationError | null {
  if (!Array.isArray(value)) {
    return { field, message: `${field} must be an array` };
  }
  if (value.length > maxItems) {
    return { field, message: `${field} must have at most ${maxItems} items` };
  }
  return null;
}

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: Record<string, unknown>;
    }>;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: { mid: string; text: string };
    }>;
  }>;
}

// Verify Meta webhook signature using Web Crypto API
async function verifyMetaSignature(
  payload: string,
  signature: string | null,
  appSecret: string
): Promise<boolean> {
  if (!signature) return false;
  
  const expectedSignature = signature.split("sha256=")[1];
  if (!expectedSignature) return false;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(appSecret);
    const data = encoder.encode(payload);
    
    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Compute HMAC signature
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    
    // Constant-time comparison to prevent timing attacks
    if (computedSignature.length !== expectedSignature.length) return false;
    
    let result = 0;
    for (let i = 0; i < computedSignature.length; i++) {
      result |= computedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Handle webhook verification (GET request from Meta)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Use environment variable for verify token
    const WEBHOOK_VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "socialrep_webhook_verify_token";

    // Validate inputs
    if (!mode || !token || !challenge) {
      return new Response("Bad Request", { status: 400 });
    }

    if (mode.length > 50 || token.length > 200 || challenge.length > 200) {
      return new Response("Bad Request", { status: 400 });
    }

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check request size (max 1MB for webhooks)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature if app secret is configured
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    if (META_APP_SECRET) {
      const signature = req.headers.get("x-hub-signature-256");
      const isValid = await verifyMetaSignature(rawBody, signature, META_APP_SECRET);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Parse JSON
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error("Invalid JSON in webhook payload");
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payload structure
    const objectErr = validateString(payload.object, "object", { required: true, maxLength: 50 });
    if (objectErr) {
      console.error("Invalid webhook object field");
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entryErr = validateArray(payload.entry, "entry", 100);
    if (entryErr) {
      console.error("Invalid webhook entry array");
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Webhook received:", payload.object, "entries:", payload.entry?.length);

    // Process Facebook/Instagram webhooks
    if (payload.object === "page" || payload.object === "instagram") {
      for (const entry of payload.entry) {
        // Validate entry ID
        if (typeof entry.id !== "string" || entry.id.length > 100) {
          continue;
        }

        // Handle feed changes (comments, posts)
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes.slice(0, 50)) {
            if (change.field === "feed" || change.field === "comments") {
              const value = change.value;
              if (!value || typeof value !== "object") continue;
              
              // Find the user associated with this page
              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", entry.id)
                .eq("is_active", true)
                .single();

              if (platform) {
                const externalId = String(value.comment_id || value.post_id || "").slice(0, 200);
                if (!externalId) continue;

                // Check if interaction already exists
                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", externalId)
                  .single();

                if (!existing) {
                  // Sanitize content
                  const content = String(value.message || value.text || "").slice(0, 10000);
                  const authorName = String(value.sender_name || (value.from as Record<string, unknown>)?.name || "").slice(0, 200);
                  const authorHandle = String(value.sender_id || (value.from as Record<string, unknown>)?.id || "").slice(0, 200);
                  const postId = String(value.post_id || "").slice(0, 200);

                  // Insert new interaction
                  const { data: newInteraction } = await supabase.from("interactions").insert({
                    user_id: platform.user_id,
                    external_id: externalId,
                    platform: payload.object === "instagram" ? "instagram" : "facebook",
                    interaction_type: value.item === "comment" ? "comment" : "post",
                    content: content,
                    author_name: authorName || null,
                    author_handle: authorHandle || null,
                    post_url: postId ? `https://facebook.com/${postId}` : null,
                    status: "pending",
                    sentiment: "neutral",
                  }).select("id").single();

                  console.log("New interaction created from webhook");

                  // Auto-detect leads based on keywords
                  if (newInteraction) {
                    const { data: profile } = await supabase
                      .from("profiles")
                      .select("lead_keywords")
                      .eq("user_id", platform.user_id)
                      .single();

                    const leadKeywords = profile?.lead_keywords || [
                      "pricing", "price", "cost", "buy", "purchase", 
                      "interested", "demo", "quote", "trial", "how much"
                    ];

                    const contentLower = content.toLowerCase();
                    const isLead = leadKeywords.some((kw: string) => contentLower.includes(kw.toLowerCase()));

                    if (isLead) {
                      // Create lead from interaction
                      await supabase.from("leads").insert({
                        user_id: platform.user_id,
                        source_interaction_id: newInteraction.id,
                        source_platform: payload.object === "instagram" ? "instagram" : "facebook",
                        contact_name: authorName || null,
                        status: "new",
                        score: 50,
                        notes: `Auto-detected from ${payload.object} comment: "${content.slice(0, 200)}..."`,
                      });

                      console.log("Lead auto-created from interaction keywords");
                    }
                  }
                }
              }
            }
          }
        }

        // Handle direct messages
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const message of entry.messaging.slice(0, 50)) {
            if (message.message?.text) {
              // Validate message structure
              if (typeof message.recipient?.id !== "string" || typeof message.sender?.id !== "string") {
                continue;
              }

              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", message.recipient.id)
                .eq("is_active", true)
                .single();

              if (platform) {
                const messageId = String(message.message.mid || "").slice(0, 200);
                if (!messageId) continue;

                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", messageId)
                  .single();

                if (!existing) {
                  await supabase.from("interactions").insert({
                    user_id: platform.user_id,
                    external_id: messageId,
                    platform: "facebook",
                    interaction_type: "dm",
                    content: String(message.message.text).slice(0, 10000),
                    author_handle: String(message.sender.id).slice(0, 200),
                    status: "pending",
                    sentiment: "neutral",
                  });

                  console.log("New DM created from webhook");
                }
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 for webhooks to prevent retries
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
