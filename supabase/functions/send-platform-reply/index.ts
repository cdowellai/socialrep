import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const META_GRAPH_URL = "https://graph.facebook.com/v19.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { replyId, interactionId, content, platform } = await req.json();

    // Get the interaction details
    const { data: interaction } = await supabase
      .from("interactions")
      .select("*")
      .eq("id", interactionId)
      .eq("user_id", user.id)
      .single();

    if (!interaction) {
      return new Response(
        JSON.stringify({ success: false, error: "Interaction not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get platform connection
    const { data: connection } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!connection || !connection.access_token) {
      // Platform not connected - reply saved locally only
      await supabase
        .from("interactions")
        .update({ status: "responded", response: content, responded_at: new Date().toISOString() })
        .eq("id", interactionId);

      return new Response(
        JSON.stringify({ success: false, notConnected: true, message: "Reply saved locally. Platform not connected." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Post reply to Facebook
    let replyResult: any = null;

    if (platform === "facebook" || platform === "instagram") {
      if (interaction.interaction_type === "comment" && interaction.external_id) {
        console.log(`[reply] Posting comment reply to ${interaction.external_id}`);
        const replyRes = await fetch(
          `${META_GRAPH_URL}/${encodeURIComponent(interaction.external_id)}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              access_token: connection.access_token,
            }),
          }
        );
        replyResult = await replyRes.json();
      } else if (interaction.interaction_type === "dm" && interaction.author_handle) {
        console.log(`[reply] Sending DM to ${interaction.author_handle}`);
        const replyRes = await fetch(
          `${META_GRAPH_URL}/${encodeURIComponent(connection.platform_account_id!)}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: interaction.author_handle },
              message: { text: content },
              access_token: connection.access_token,
            }),
          }
        );
        replyResult = await replyRes.json();
      }

      if (replyResult?.error) {
        console.error("[reply] Facebook API error:", JSON.stringify(replyResult.error));
        // Still save reply locally even if platform posting fails
        await supabase
          .from("interactions")
          .update({ status: "responded", response: content, responded_at: new Date().toISOString() })
          .eq("id", interactionId);

        if (replyId) {
          await supabase
            .from("interaction_replies")
            .update({ platform_status: "failed", platform_error: replyResult.error.message })
            .eq("id", replyId);
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: replyResult.error.message,
            platformError: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update interaction status
    await supabase
      .from("interactions")
      .update({
        status: "responded",
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        response: content,
        responded_at: new Date().toISOString(),
      })
      .eq("id", interactionId);

    // Update reply record with platform reply ID
    if (replyId && replyResult) {
      await supabase
        .from("interaction_replies")
        .update({
          platform_status: "sent",
          platform_reply_id: replyResult.id || replyResult.message_id || null,
        })
        .eq("id", replyId);
    }

    console.log(`[reply] Success for interaction ${interactionId}, FB ID: ${replyResult?.id || replyResult?.message_id || "N/A"}`);

    return new Response(
      JSON.stringify({
        success: true,
        platformReplyId: replyResult?.id || replyResult?.message_id || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
