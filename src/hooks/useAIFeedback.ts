import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type FeedbackType = "accepted" | "edited" | "rejected";

interface SubmitFeedbackParams {
  interactionId: string;
  originalResponse: string;
  editedResponse?: string;
  feedbackType: FeedbackType;
  rating?: number;
  rejectionReason?: string;
}

interface AIFeedbackStats {
  total: number;
  accepted: number;
  edited: number;
  rejected: number;
  avgRating: number;
}

export function useAIFeedback() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(
    async (params: SubmitFeedbackParams): Promise<boolean> => {
      if (!user) {
        setError("Not authenticated");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const { error: insertError } = await supabase
          .from("ai_response_feedback")
          .insert({
            user_id: user.id,
            interaction_id: params.interactionId,
            original_response: params.originalResponse,
            edited_response: params.editedResponse || null,
            feedback_type: params.feedbackType,
            rating: params.rating || null,
            rejection_reason: params.rejectionReason || null,
          });

        if (insertError) throw insertError;
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit feedback";
        setError(message);
        console.error("AI feedback error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getFeedbackStats = useCallback(async (): Promise<AIFeedbackStats | null> => {
    if (!user) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from("ai_response_feedback")
        .select("feedback_type, rating")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;

      const stats: AIFeedbackStats = {
        total: data?.length || 0,
        accepted: data?.filter((f) => f.feedback_type === "accepted").length || 0,
        edited: data?.filter((f) => f.feedback_type === "edited").length || 0,
        rejected: data?.filter((f) => f.feedback_type === "rejected").length || 0,
        avgRating: 0,
      };

      const ratings = data?.filter((f) => f.rating).map((f) => f.rating) || [];
      if (ratings.length > 0) {
        stats.avgRating = ratings.reduce((a, b) => (a || 0) + (b || 0), 0)! / ratings.length;
      }

      return stats;
    } catch (err) {
      console.error("Error fetching feedback stats:", err);
      return null;
    }
  }, [user]);

  return {
    submitFeedback,
    getFeedbackStats,
    loading,
    error,
  };
}
