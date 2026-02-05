import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, Enums } from "@/integrations/supabase/types";
import type { Stream } from "@/hooks/useStreams";

type Interaction = Tables<"interactions">;

interface UseStreamInteractionsOptions {
  stream: Stream;
  limit?: number;
}

export function useStreamInteractions({ stream, limit = 50 }: UseStreamInteractionsOptions) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchInteractions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("interactions")
        .select("*")
        .eq("user_id", user.id)
        .limit(limit + 1);

      // Apply platform filter
      if (stream.platform) {
        query = query.eq("platform", stream.platform as Enums<"interaction_platform">);
      }

      // Apply interaction type filter
      if (stream.interaction_types && stream.interaction_types.length > 0) {
        // Map string types to enum values
        const typeMapping: Record<string, Enums<"interaction_type">> = {
          comment: "comment",
          message: "dm",
          review: "review",
          mention: "mention",
        };
        const validTypes: Enums<"interaction_type">[] = ["comment", "dm", "review", "mention", "post"];
        const mappedTypes = stream.interaction_types
          .map((t) => typeMapping[t] || t)
          .filter((t): t is Enums<"interaction_type"> => validTypes.includes(t as any));
        
        if (mappedTypes.length > 0) {
          query = query.in("interaction_type", mappedTypes);
        }
      }

      // Apply additional filters from JSONB
      const filters = stream.filters as Record<string, any> || {};
      
      if (filters.sentiment) {
        query = query.eq("sentiment", filters.sentiment);
      }
      
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.minUrgency) {
        query = query.gte("urgency_score", filters.minUrgency);
      }

      // Sort by urgency if enabled, otherwise by created_at
      if (stream.auto_sort_by_urgency) {
        query = query.order("urgency_score", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const hasMoreItems = (data?.length || 0) > limit;
      setHasMore(hasMoreItems);
      setInteractions((data || []).slice(0, limit));
    } catch (error) {
      console.error("Error fetching stream interactions:", error);
    } finally {
      setLoading(false);
    }
  }, [user, stream, limit]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  // Real-time subscription for interactions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`stream-interactions-${stream.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newInteraction = payload.new as Interaction;
            // Check if interaction matches stream filters
            if (matchesStreamFilters(newInteraction, stream)) {
              setInteractions((prev) => {
                const updated = [newInteraction, ...prev];
                if (stream.auto_sort_by_urgency) {
                  return updated.sort((a, b) => 
                    (b.urgency_score || 0) - (a.urgency_score || 0) || 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  ).slice(0, limit);
                }
                return updated.slice(0, limit);
              });
            }
          } else if (payload.eventType === "UPDATE") {
            setInteractions((prev) =>
              prev.map((i) => (i.id === payload.new.id ? (payload.new as Interaction) : i))
            );
          } else if (payload.eventType === "DELETE") {
            setInteractions((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, stream, limit]);

  return {
    interactions,
    loading,
    hasMore,
    refetch: fetchInteractions,
  };
}

function matchesStreamFilters(interaction: Interaction, stream: Stream): boolean {
  // Platform filter
  if (stream.platform && interaction.platform !== stream.platform) {
    return false;
  }

  // Interaction type filter
  if (stream.interaction_types && stream.interaction_types.length > 0) {
    const typeMapping: Record<string, string> = {
      comment: "comment",
      message: "dm",
      review: "review",
      mention: "mention",
    };
    const mappedTypes = stream.interaction_types.map((t) => typeMapping[t] || t);
    if (!mappedTypes.includes(interaction.interaction_type)) {
      return false;
    }
  }

  // Additional JSONB filters
  const filters = stream.filters as Record<string, any> || {};
  
  if (filters.sentiment && interaction.sentiment !== filters.sentiment) {
    return false;
  }
  
  if (filters.status && interaction.status !== filters.status) {
    return false;
  }

  if (filters.minUrgency && (interaction.urgency_score || 0) < filters.minUrgency) {
    return false;
  }

  return true;
}
