import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Stream = Tables<"streams">;

interface UnreadCounts {
  [streamId: string]: number;
}

export function useStreamUnreadCounts(streams: Stream[]) {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [loading, setLoading] = useState(true);

  const fetchUnreadCounts = useCallback(async () => {
    if (!user || streams.length === 0) {
      setUnreadCounts({});
      setLoading(false);
      return;
    }

    try {
      // Fetch read state for all streams
      const { data: readStates } = await supabase
        .from("stream_read_state")
        .select("*")
        .eq("user_id", user.id)
        .in("stream_id", streams.map(s => s.id));

      const readStateMap = new Map(
        (readStates || []).map(rs => [rs.stream_id, rs.last_interaction_read_at])
      );

      // Calculate unread counts for each stream
      const counts: UnreadCounts = {};

      await Promise.all(
        streams.map(async (stream) => {
          const lastReadAt = readStateMap.get(stream.id);
          
          let query = supabase
            .from("interactions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "pending");

          // Apply stream filters
          if (stream.platform) {
            query = query.eq("platform", stream.platform as any);
          }

          if (stream.interaction_types && stream.interaction_types.length > 0) {
            type InteractionType = "comment" | "dm" | "review" | "mention" | "post";
            const typeMapping: Record<string, InteractionType> = {
              comment: "comment",
              message: "dm",
              review: "review",
              mention: "mention",
            };
            const mappedTypes = stream.interaction_types
              .map(t => typeMapping[t] || t)
              .filter((t): t is InteractionType => 
                ["comment", "dm", "review", "mention", "post"].includes(t)
              );
            if (mappedTypes.length > 0) {
              query = query.in("interaction_type", mappedTypes);
            }
          }

          // Only count items after last read time
          if (lastReadAt) {
            query = query.gt("created_at", lastReadAt);
          }

          const { count } = await query;
          counts[stream.id] = count || 0;
        })
      );

      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    } finally {
      setLoading(false);
    }
  }, [user, streams]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Real-time subscription for new interactions
  useEffect(() => {
    if (!user || streams.length === 0) return;

    const channel = supabase
      .channel("unread-counts-interactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch counts when new interaction arrives
          fetchUnreadCounts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, streams, fetchUnreadCounts]);

  const markStreamAsRead = async (streamId: string) => {
    if (!user) return;

    try {
      await supabase
        .from("stream_read_state")
        .upsert({
          stream_id: streamId,
          user_id: user.id,
          last_interaction_read_at: new Date().toISOString(),
        }, {
          onConflict: "stream_id,user_id",
        });

      setUnreadCounts(prev => ({ ...prev, [streamId]: 0 }));
    } catch (error) {
      console.error("Error marking stream as read:", error);
    }
  };

  const getTotalUnread = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  };

  return {
    unreadCounts,
    loading,
    markStreamAsRead,
    getTotalUnread,
    refetch: fetchUnreadCounts,
  };
}
