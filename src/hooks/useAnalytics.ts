import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsSummary {
  totalInteractions: number;
  totalInteractionsChange: number;
  avgResponseTimeHours: number;
  avgResponseTimeChange: number;
  responseRate: number;
  responseRateChange: number;
  avgSentimentScore: number;
  avgSentimentScoreChange: number;
  totalReviews: number;
  totalReviewsChange: number;
  avgRating: number;
  avgRatingChange: number;
  totalLeads: number;
  totalLeadsChange: number;
}

export interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentTrendItem {
  positive: number;
  neutral: number;
  negative: number;
}

export interface PlatformBreakdown {
  platform: string;
  totalInteractions: number;
  responseRate: number;
  avgSentiment: number;
  avgResponseTimeHours: number;
}

export interface TeamMemberPerformance {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  interactionsHandled: number;
  avgResponseTimeHours: number;
  resolutionRate: number;
  sentimentScore: number;
}

export interface TopInteraction {
  id: string;
  platform: string;
  authorName: string;
  content: string;
  sentiment: string | null;
  urgencyScore: number;
  createdAt: string;
  status: string | null;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  sentiment: SentimentCounts;
  sentimentTrend: Record<string, SentimentTrendItem>;
  platformTrends: Record<string, Record<string, number>>;
  platformBreakdown: PlatformBreakdown[];
  teamPerformance: TeamMemberPerformance[];
  topInteractions: TopInteraction[];
  dateRange: {
    start: string;
    end: string;
    granularity: "daily" | "weekly" | "monthly";
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type Granularity = "daily" | "weekly" | "monthly";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (
    dateRange: DateRange,
    granularity: Granularity = "daily"
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("analytics", {
        body: { 
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          granularity,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to fetch analytics");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Analytics error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchAnalytics,
  };
}
