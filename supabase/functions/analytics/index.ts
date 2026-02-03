import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyticsRequest {
  period?: "day" | "week" | "month" | "all";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { period = "month" } = await req.json() as AnalyticsRequest;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Fetch interactions
    const { data: interactions, error: intError } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    if (intError) throw intError;

    // Fetch reviews
    const { data: reviews, error: revError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    if (revError) throw revError;

    // Fetch leads
    const { data: leads, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    if (leadError) throw leadError;

    // Calculate metrics
    const totalInteractions = interactions?.length || 0;
    const respondedInteractions = interactions?.filter(i => i.status === "responded").length || 0;
    const responseRate = totalInteractions > 0 ? (respondedInteractions / totalInteractions) * 100 : 0;

    // Sentiment distribution
    const sentimentCounts = {
      positive: interactions?.filter(i => i.sentiment === "positive").length || 0,
      neutral: interactions?.filter(i => i.sentiment === "neutral").length || 0,
      negative: interactions?.filter(i => i.sentiment === "negative").length || 0,
    };

    // Calculate reputation score (0-100)
    // Factors: response rate, positive sentiment ratio, average review rating
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    const positiveRatio = totalInteractions > 0
      ? sentimentCounts.positive / totalInteractions
      : 0;

    const reputationScore = Math.round(
      (responseRate * 0.3) + // 30% weight for response rate
      (positiveRatio * 100 * 0.3) + // 30% weight for positive sentiment
      (avgRating * 20 * 0.4) // 40% weight for review rating (scaled to 100)
    );

    // Platform breakdown
    const platformCounts: Record<string, number> = {};
    interactions?.forEach(i => {
      platformCounts[i.platform] = (platformCounts[i.platform] || 0) + 1;
    });

    // Lead conversion metrics
    const totalLeads = leads?.length || 0;
    const convertedLeads = leads?.filter(l => l.status === "converted").length || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Average response time (mock calculation since we don't track exact times)
    const avgResponseTimeHours = respondedInteractions > 0 ? 2.5 : 0;

    // Trend data (interactions per day for charts)
    const trendData: Record<string, number> = {};
    interactions?.forEach(i => {
      const date = new Date(i.created_at).toISOString().split("T")[0];
      trendData[date] = (trendData[date] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        summary: {
          reputationScore,
          totalInteractions,
          respondedInteractions,
          responseRate: Math.round(responseRate),
          avgResponseTimeHours,
          totalReviews: reviews?.length || 0,
          avgRating: Math.round(avgRating * 10) / 10,
          totalLeads,
          convertedLeads,
          conversionRate: Math.round(conversionRate),
        },
        sentiment: sentimentCounts,
        platforms: platformCounts,
        trends: trendData,
        period,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analytics error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
