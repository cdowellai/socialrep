import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
  if (typeof value !== "string") return { field, message: `${field} must be a string` };
  if (maxLength !== undefined && value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }
  return null;
}

function validateArray(value: unknown, field: string, maxItems = 100): ValidationError | null {
  if (!Array.isArray(value)) return { field, message: `${field} must be an array` };
  if (value.length > maxItems) return { field, message: `${field} must have at most ${maxItems} items` };
  return null;
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
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
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

    const WEBHOOK_VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "socialrep_webhook_verify_token";

    if (!mode || !token || !challenge) return new Response("Bad Request", { status: 400 });
    if (mode.length > 50 || token.length > 200 || challenge.length > 200) return new Response("Bad Request", { status: 400 });

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
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rawBody = await req.text();

    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    if (META_APP_SECRET) {
      const signature = req.headers.get("x-hub-signature-256");
      const isValid = await verifyMetaSignature(rawBody, signature, META_APP_SECRET);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error("Invalid JSON in webhook payload");
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const objectErr = validateString(payload.object, "object", { required: true, maxLength: 50 });
    if (objectErr) {
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const entryErr = validateArray(payload.entry, "entry", 100);
    if (entryErr) {
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Webhook received:", payload.object, "entries:", payload.entry?.length);

    // ---- Facebook Page webhooks ----
    if (payload.object === "page") {
      for (const entry of payload.entry) {
        if (typeof entry.id !== "string" || entry.id.length > 100) continue;

        // Feed changes (comments on posts)
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes.slice(0, 50)) {
            if (change.field === "feed" || change.field === "comments") {
              const value = change.value;
              if (!value || typeof value !== "object") continue;

              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", entry.id)
                .eq("platform", "facebook")
                .eq("is_active", true)
                .single();

              if (platform) {
                const externalId = String(value.comment_id || value.post_id || "").slice(0, 200);
                if (!externalId) continue;

                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", externalId)
                  .single();

                if (!existing) {
                  const content = String(value.message || value.text || "").slice(0, 10000);
                  const authorName = String(value.sender_name || (value.from as any)?.name || "").slice(0, 200);
                  const authorHandle = String(value.sender_id || (value.from as any)?.id || "").slice(0, 200);
                  const postId = String(value.post_id || "").slice(0, 200);

                  const { data: newInteraction } = await supabase.from("interactions").insert({
                    user_id: platform.user_id,
                    external_id: externalId,
                    platform: "facebook",
                    interaction_type: value.item === "comment" ? "comment" : "post",
                    content,
                    author_name: authorName || null,
                    author_handle: authorHandle || null,
                    post_url: postId ? `https://facebook.com/${postId}` : null,
                    status: "pending",
                    sentiment: "neutral",
                  }).select("id").single();

                  console.log("New Facebook interaction created from webhook:", externalId);

                  // Auto-detect leads
                  if (newInteraction) {
                    await checkAndCreateLead(supabase, platform.user_id, newInteraction.id, content, "facebook");
                  }
                }
              }
            }
          }
        }

        // Facebook Messenger DMs
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const message of entry.messaging.slice(0, 50)) {
            if (message.message?.text) {
              if (typeof message.recipient?.id !== "string" || typeof message.sender?.id !== "string") continue;

              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", message.recipient.id)
                .eq("platform", "facebook")
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
                    metadata: { sender_psid: message.sender.id, recipient_id: message.recipient.id },
                  });
                  console.log("New Facebook DM created from webhook:", messageId);
                }
              }
            }
          }
        }
      }
    }

    // ---- FIX: Instagram webhooks ----
    if (payload.object === "instagram") {
      for (const entry of payload.entry) {
        if (typeof entry.id !== "string" || entry.id.length > 100) continue;

        // Instagram comment changes
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes.slice(0, 50)) {
            if (change.field === "comments" || change.field === "mentions") {
              const value = change.value;
              if (!value || typeof value !== "object") continue;

              // Find user by Instagram account ID
              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", entry.id)
                .eq("platform", "instagram")
                .eq("is_active", true)
                .single();

              if (platform) {
                const externalId = String(value.id || "").slice(0, 200);
                if (!externalId) continue;

                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", externalId)
                  .single();

                if (!existing) {
                  const content = String(value.text || value.message || "").slice(0, 10000);
                  const authorName = String(value.username || value.from?.username || "").slice(0, 200);
                  const mediaId = String(value.media?.id || "").slice(0, 200);

                  const { data: newInteraction } = await supabase.from("interactions").insert({
                    user_id: platform.user_id,
                    external_id: externalId,
                    platform: "instagram",
                    interaction_type: "comment",
                    content,
                    author_name: authorName || null,
                    author_handle: authorName || null,
                    post_url: mediaId ? `https://instagram.com/p/${mediaId}` : null,
                    status: "pending",
                    sentiment: "neutral",
                  }).select("id").single();

                  console.log("New Instagram comment created from webhook:", externalId);

                  if (newInteraction) {
                    await checkAndCreateLead(supabase, platform.user_id, newInteraction.id, content, "instagram");
                  }
                }
              }
            }
          }
        }

        // Instagram Direct Messages
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const message of entry.messaging.slice(0, 50)) {
            if (message.message?.text) {
              if (typeof message.recipient?.id !== "string" || typeof message.sender?.id !== "string") continue;

              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", message.recipient.id)
                .eq("platform", "instagram")
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
                    platform: "instagram",
                    interaction_type: "dm",
                    content: String(message.message.text).slice(0, 10000),
                    author_handle: String(message.sender.id).slice(0, 200),
                    status: "pending",
                    sentiment: "neutral",
                    metadata: { sender_id: message.sender.id, recipient_id: message.recipient.id },
                  });
                  console.log("New Instagram DM created from webhook:", messageId);
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
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper: auto-detect leads from interaction content
async function checkAndCreateLead(
  supabase: any,
  userId: string,
  interactionId: string,
  content: string,
  platform: string
) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("lead_keywords")
      .eq("user_id", userId)
      .single();

    const leadKeywords = profile?.lead_keywords || [
      "pricing", "price", "cost", "buy", "purchase",
      "interested", "demo", "quote", "trial", "how much",
    ];

    const contentLower = content.toLowerCase();
    const isLead = leadKeywords.some((kw: string) => contentLower.includes(kw.toLowerCase()));

    if (isLead) {
      await supabase.from("leads").insert({
        user_id: userId,
        source_interaction_id: interactionId,
        source_platform: platform,
        status: "new",
        score: 50,
        notes: `Auto-detected from ${platform} comment: "${content.slice(0, 200)}..."`,
      });
      console.log("Lead auto-created from interaction keywords");
    }
  } catch (err) {
    console.error("Lead detection error:", err);
  }
}

// Trigger re-deploy
