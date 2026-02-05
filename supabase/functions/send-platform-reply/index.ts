import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    // Check if platform is connected by looking for access tokens
    const { data: connection } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("is_active", true)
      .single();

    if (!connection || !connection.access_token) {
      // Platform not connected - reply saved locally only
      return new Response(
        JSON.stringify({ success: false, notConnected: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Implement actual platform API calls here
    // For now, return success with a note that APIs need to be configured
    // Each platform requires specific OAuth flows and API integrations

    // Update interaction status
    await supabase
      .from("interactions")
      .update({ status: "responded" })
      .eq("id", interactionId);

    return new Response(
      JSON.stringify({ success: true, platformReplyId: null, message: "Reply saved. Platform API integration pending." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
