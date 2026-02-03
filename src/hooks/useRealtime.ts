import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "interactions" | "reviews" | "leads" | "connected_platforms";

interface UseRealtimeOptions<T> {
  table: TableName;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { old: T }) => void;
  enabled?: boolean;
}

export function useRealtime<T extends { id: string; user_id: string }>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      // Filter by user_id for security
      if (payload.eventType === "INSERT" && payload.new) {
        const newRecord = payload.new as T;
        if (newRecord.user_id === user?.id && onInsert) {
          onInsert(newRecord);
        }
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const updatedRecord = payload.new as T;
        if (updatedRecord.user_id === user?.id && onUpdate) {
          onUpdate(updatedRecord);
        }
      } else if (payload.eventType === "DELETE" && payload.old) {
        const deletedRecord = payload.old as T;
        if (deletedRecord.user_id === user?.id && onDelete) {
          onDelete({ old: deletedRecord });
        }
      }
    },
    [user, onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    if (!enabled || !user) return;

    const channelName = `${table}-changes-${user.id}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: `user_id=eq.${user.id}`,
        },
        handleChange as any
      )
      .subscribe((status) => {
        console.log(`Realtime subscription to ${table}:`, status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, user, enabled, handleChange]);

  return { isSubscribed: !!channelRef.current };
}
