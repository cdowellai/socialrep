import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsSummary {
  reputationScore: number;
  totalInteractions: number;
  respondedInteractions: number;
  responseRate: number;
  avgResponseTimeHours: number;
  totalReviews: number;
  avgRating: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  platforms: Record<string, number>;
  trends: Record<string, number>;
  period: string;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (period: "day" | "week" | "month" | "all" = "month") => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("analytics", {
        body: { period },
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
