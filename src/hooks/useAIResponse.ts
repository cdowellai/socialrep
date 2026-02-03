import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AIResponseResult {
  response: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
}

interface UseAIResponseOptions {
  brandVoice?: string;
}

export function useAIResponse(options: UseAIResponseOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = useCallback(
    async (
      content: string,
      platform: string,
      interactionType?: string,
      existingSentiment?: string
    ): Promise<AIResponseResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("ai-response", {
          body: {
            content,
            platform,
            interactionType: interactionType || "comment",
            sentiment: existingSentiment,
            brandVoice: options.brandVoice || "professional and friendly",
          },
        });

        if (fnError) {
          throw new Error(fnError.message || "Failed to generate AI response");
        }

        if (data.error) {
          throw new Error(data.error);
        }

        return {
          response: data.response,
          sentiment: data.sentiment,
          sentimentScore: data.sentimentScore,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("AI response error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options.brandVoice]
  );

  return {
    generateResponse,
    loading,
    error,
  };
}
