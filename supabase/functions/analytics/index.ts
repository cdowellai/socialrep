import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  granularity?: "daily" | "weekly" | "monthly";
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user with anon client + getClaims
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = { id: claimsData.claims.sub as string };
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json() as AnalyticsRequest;
    
    // Handle date range
    const now = new Date();
    const endDate = body.endDate ? new Date(body.endDate) : now;
    const startDate = body.startDate 
      ? new Date(body.startDate) 
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime());
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    
    const granularity = body.granularity || "daily";

    // Fetch current period interactions
    const { data: interactions, error: intError } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (intError) throw intError;

    // Fetch previous period interactions for comparison
    const { data: prevInteractions, error: prevIntError } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", prevStartDate.toISOString())
      .lt("created_at", prevEndDate.toISOString());

    if (prevIntError) throw prevIntError;

    // Fetch reviews
    const { data: reviews, error: revError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (revError) throw revError;

    // Fetch previous reviews
    const { data: prevReviews, error: prevRevError } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", prevStartDate.toISOString())
      .lt("created_at", prevEndDate.toISOString());

    if (prevRevError) throw prevRevError;

    // Fetch leads
    const { data: leads, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (leadError) throw leadError;

    // Fetch previous leads
    const { data: prevLeads, error: prevLeadError } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", prevStartDate.toISOString())
      .lt("created_at", prevEndDate.toISOString());

    if (prevLeadError) throw prevLeadError;

    // Fetch team members with their interaction stats
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_team_id")
      .eq("user_id", user.id)
      .single();

    let teamPerformance: any[] = [];
    if (profile?.current_team_id) {
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select(`
          user_id,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("team_id", profile.current_team_id)
        .not("accepted_at", "is", null);

      if (teamMembers) {
        // Fetch interaction replies for team members
        const { data: replies } = await supabase
          .from("interaction_replies")
          .select("*")
          .eq("team_id", profile.current_team_id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        teamPerformance = teamMembers.map((member: any) => {
          const memberReplies = replies?.filter((r: any) => r.user_id === member.user_id) || [];
          const memberInteractions = interactions?.filter((i: any) => i.assigned_to === member.user_id) || [];
          const resolvedInteractions = memberInteractions.filter((i: any) => i.status === "responded");
          
          // Calculate avg response time (time between interaction created and first reply)
          let totalResponseTime = 0;
          let responseCount = 0;
          resolvedInteractions.forEach((interaction: any) => {
            const reply = memberReplies.find((r: any) => r.interaction_id === interaction.id);
            if (reply) {
              const responseTime = new Date(reply.created_at).getTime() - new Date(interaction.created_at).getTime();
              totalResponseTime += responseTime;
              responseCount++;
            }
          });

          const avgResponseTimeMs = responseCount > 0 ? totalResponseTime / responseCount : 0;
          const avgResponseTimeHours = avgResponseTimeMs / (1000 * 60 * 60);

          // Calculate sentiment of handled interactions
          const sentiments = memberInteractions.map((i: any) => i.sentiment).filter(Boolean);
          const positiveCount = sentiments.filter((s: string) => s === "positive").length;
          const sentimentScore = sentiments.length > 0 ? (positiveCount / sentiments.length) * 100 : 0;

          return {
            userId: member.user_id,
            name: member.profiles?.full_name || member.profiles?.email?.split("@")[0] || "Unknown",
            email: member.profiles?.email,
            avatarUrl: member.profiles?.avatar_url,
            interactionsHandled: memberInteractions.length,
            avgResponseTimeHours: Math.round(avgResponseTimeHours * 10) / 10,
            resolutionRate: memberInteractions.length > 0 
              ? Math.round((resolvedInteractions.length / memberInteractions.length) * 100) 
              : 0,
            sentimentScore: Math.round(sentimentScore),
          };
        });
      }
    }

    // Calculate metrics
    const totalInteractions = interactions?.length || 0;
    const prevTotalInteractions = prevInteractions?.length || 0;
    const respondedInteractions = interactions?.filter(i => i.status === "responded").length || 0;
    const prevRespondedInteractions = prevInteractions?.filter(i => i.status === "responded").length || 0;
    
    const responseRate = totalInteractions > 0 ? (respondedInteractions / totalInteractions) * 100 : 0;
    const prevResponseRate = prevTotalInteractions > 0 ? (prevRespondedInteractions / prevTotalInteractions) * 100 : 0;

    // Calculate response time from responded_at field
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    interactions?.forEach((i: any) => {
      if (i.responded_at && i.status === "responded") {
        const responseTime = new Date(i.responded_at).getTime() - new Date(i.created_at).getTime();
        totalResponseTime += responseTime;
        responseTimeCount++;
      }
    });
    const avgResponseTimeHours = responseTimeCount > 0 
      ? (totalResponseTime / responseTimeCount) / (1000 * 60 * 60) 
      : 0;

    // Calculate previous period response time
    let prevTotalResponseTime = 0;
    let prevResponseTimeCount = 0;
    prevInteractions?.forEach((i: any) => {
      if (i.responded_at && i.status === "responded") {
        const responseTime = new Date(i.responded_at).getTime() - new Date(i.created_at).getTime();
        prevTotalResponseTime += responseTime;
        prevResponseTimeCount++;
      }
    });
    const prevAvgResponseTimeHours = prevResponseTimeCount > 0 
      ? (prevTotalResponseTime / prevResponseTimeCount) / (1000 * 60 * 60) 
      : 0;

    // Sentiment distribution
    const sentimentCounts = {
      positive: interactions?.filter(i => i.sentiment === "positive").length || 0,
      neutral: interactions?.filter(i => i.sentiment === "neutral").length || 0,
      negative: interactions?.filter(i => i.sentiment === "negative").length || 0,
    };

    // Calculate average sentiment score (-1 to +1)
    let totalSentimentScore = 0;
    interactions?.forEach((i: any) => {
      if (i.sentiment === "positive") totalSentimentScore += 1;
      else if (i.sentiment === "negative") totalSentimentScore -= 1;
      // neutral = 0
    });
    const avgSentimentScore = totalInteractions > 0 ? totalSentimentScore / totalInteractions : 0;

    // Previous sentiment
    let prevTotalSentimentScore = 0;
    prevInteractions?.forEach((i: any) => {
      if (i.sentiment === "positive") prevTotalSentimentScore += 1;
      else if (i.sentiment === "negative") prevTotalSentimentScore -= 1;
    });
    const prevAvgSentimentScore = prevTotalInteractions > 0 ? prevTotalSentimentScore / prevTotalInteractions : 0;

    // Reviews metrics
    const totalReviews = reviews?.length || 0;
    const prevTotalReviews = prevReviews?.length || 0;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;
    const prevAvgRating = prevTotalReviews > 0
      ? prevReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / prevTotalReviews
      : 0;

    // Leads metrics
    const totalLeads = leads?.length || 0;
    const prevTotalLeads = prevLeads?.length || 0;

    // Platform breakdown with detailed stats
    const platformStats: Record<string, {
      total: number;
      responded: number;
      positive: number;
      negative: number;
      neutral: number;
      totalResponseTime: number;
      responseCount: number;
    }> = {};

    interactions?.forEach((i: any) => {
      if (!platformStats[i.platform]) {
        platformStats[i.platform] = {
          total: 0,
          responded: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          totalResponseTime: 0,
          responseCount: 0,
        };
      }
      platformStats[i.platform].total++;
      if (i.status === "responded") {
        platformStats[i.platform].responded++;
        if (i.responded_at) {
          const responseTime = new Date(i.responded_at).getTime() - new Date(i.created_at).getTime();
          platformStats[i.platform].totalResponseTime += responseTime;
          platformStats[i.platform].responseCount++;
        }
      }
      if (i.sentiment === "positive") platformStats[i.platform].positive++;
      else if (i.sentiment === "negative") platformStats[i.platform].negative++;
      else platformStats[i.platform].neutral++;
    });

    const platformBreakdown = Object.entries(platformStats).map(([platform, stats]) => ({
      platform,
      totalInteractions: stats.total,
      responseRate: stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0,
      avgSentiment: stats.total > 0 
        ? ((stats.positive - stats.negative) / stats.total)
        : 0,
      avgResponseTimeHours: stats.responseCount > 0 
        ? Math.round((stats.totalResponseTime / stats.responseCount) / (1000 * 60 * 60) * 10) / 10
        : 0,
    }));

    // Trend data based on granularity
    const trendData: Record<string, Record<string, number>> = {};
    const sentimentTrend: Record<string, { positive: number; neutral: number; negative: number }> = {};
    
    interactions?.forEach((i: any) => {
      let dateKey: string;
      const date = new Date(i.created_at);
      
      if (granularity === "daily") {
        dateKey = date.toISOString().split("T")[0];
      } else if (granularity === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
      } else {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      
      // Platform trends
      if (!trendData[dateKey]) {
        trendData[dateKey] = {};
      }
      trendData[dateKey][i.platform] = (trendData[dateKey][i.platform] || 0) + 1;
      
      // Sentiment trends
      if (!sentimentTrend[dateKey]) {
        sentimentTrend[dateKey] = { positive: 0, neutral: 0, negative: 0 };
      }
      if (i.sentiment === "positive") sentimentTrend[dateKey].positive++;
      else if (i.sentiment === "negative") sentimentTrend[dateKey].negative++;
      else sentimentTrend[dateKey].neutral++;
    });

    // Top urgent interactions
    const urgentInteractions = interactions
      ?.filter((i: any) => i.status !== "responded" && i.status !== "archived")
      .sort((a: any, b: any) => (b.urgency_score || 0) - (a.urgency_score || 0))
      .slice(0, 5)
      .map((i: any) => ({
        id: i.id,
        platform: i.platform,
        authorName: i.author_name || i.author_handle || "Unknown",
        content: i.content,
        sentiment: i.sentiment,
        urgencyScore: i.urgency_score || 5,
        createdAt: i.created_at,
        status: i.status,
      })) || [];

    // Calculate percentage changes
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return new Response(
      JSON.stringify({
        summary: {
          totalInteractions,
          totalInteractionsChange: calcChange(totalInteractions, prevTotalInteractions),
          avgResponseTimeHours: Math.round(avgResponseTimeHours * 10) / 10,
          avgResponseTimeChange: prevAvgResponseTimeHours > 0 
            ? calcChange(avgResponseTimeHours, prevAvgResponseTimeHours) * -1 // Lower is better
            : 0,
          responseRate: Math.round(responseRate),
          responseRateChange: calcChange(responseRate, prevResponseRate),
          avgSentimentScore: Math.round(avgSentimentScore * 100) / 100,
          avgSentimentScoreChange: calcChange(avgSentimentScore * 100, prevAvgSentimentScore * 100),
          totalReviews,
          totalReviewsChange: calcChange(totalReviews, prevTotalReviews),
          avgRating: Math.round(avgRating * 10) / 10,
          avgRatingChange: calcChange(avgRating * 10, prevAvgRating * 10),
          totalLeads,
          totalLeadsChange: calcChange(totalLeads, prevTotalLeads),
        },
        sentiment: sentimentCounts,
        sentimentTrend,
        platformTrends: trendData,
        platformBreakdown,
        teamPerformance,
        topInteractions: urgentInteractions,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          granularity,
        },
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
