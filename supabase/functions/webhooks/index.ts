import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: any;
    }>;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: { mid: string; text: string };
    }>;
  }>;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json() as WebhookPayload;
    console.log("Webhook received:", JSON.stringify(payload, null, 2));

    // Process Facebook/Instagram webhooks
    if (payload.object === "page" || payload.object === "instagram") {
      for (const entry of payload.entry) {
        // Handle feed changes (comments, posts)
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === "feed" || change.field === "comments") {
              const value = change.value;
              
              // Find the user associated with this page
              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", entry.id)
                .eq("is_active", true)
                .single();

              if (platform) {
                // Check if interaction already exists
                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", value.comment_id || value.post_id)
                  .single();

                if (!existing) {
                  // Insert new interaction
                  await supabase.from("interactions").insert({
                    user_id: platform.user_id,
                    external_id: value.comment_id || value.post_id,
                    platform: payload.object === "instagram" ? "instagram" : "facebook",
                    interaction_type: value.item === "comment" ? "comment" : "post",
                    content: value.message || value.text || "",
                    author_name: value.sender_name || value.from?.name,
                    author_handle: value.sender_id || value.from?.id,
                    post_url: value.post_id ? `https://facebook.com/${value.post_id}` : null,
                    status: "pending",
                    sentiment: "neutral",
                  });

                  console.log("New interaction created from webhook");
                }
              }
            }
          }
        }

        // Handle direct messages
        if (entry.messaging) {
          for (const message of entry.messaging) {
            if (message.message?.text) {
              const { data: platform } = await supabase
                .from("connected_platforms")
                .select("user_id")
                .eq("platform_account_id", message.recipient.id)
                .eq("is_active", true)
                .single();

              if (platform) {
                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", message.message.mid)
                  .single();

                if (!existing) {
                  await supabase.from("interactions").insert({
                    user_id: platform.user_id,
                    external_id: message.message.mid,
                    platform: "facebook",
                    interaction_type: "dm",
                    content: message.message.text,
                    author_handle: message.sender.id,
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
