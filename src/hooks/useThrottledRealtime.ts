import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "interactions" | "reviews" | "leads" | "connected_platforms";

interface UseThrottledRealtimeOptions<T> {
  table: TableName;
  onBatchUpdate: (changes: BatchChange<T>[]) => void;
  throttleMs?: number;
  enabled?: boolean;
}

export interface BatchChange<T> {
  type: "INSERT" | "UPDATE" | "DELETE";
  record: T;
  oldRecord?: T;
}

/**
 * Throttled realtime hook for high-volume updates.
 * Batches multiple changes into a single callback to prevent overwhelming the UI.
 */
export function useThrottledRealtime<T extends { id: string; user_id: string }>({
  table,
  onBatchUpdate,
  throttleMs = 2000, // Default 2 second batching for high volume
  enabled = true,
}: UseThrottledRealtimeOptions<T>) {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pendingChangesRef = useRef<BatchChange<T>[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Flush pending changes
  const flushChanges = useCallback(() => {
    if (pendingChangesRef.current.length > 0) {
      const changes = [...pendingChangesRef.current];
      pendingChangesRef.current = [];
      setPendingCount(0);
      onBatchUpdate(changes);
    }
  }, [onBatchUpdate]);

  // Schedule flush with throttling
  const scheduleFlush = useCallback(() => {
    if (timerRef.current) return; // Already scheduled

    timerRef.current = setTimeout(() => {
      flushChanges();
      timerRef.current = null;
    }, throttleMs);
  }, [flushChanges, throttleMs]);

  // Handle incoming change
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      // Filter by user_id for security
      const record = (payload.new || payload.old) as T;
      if (!record || record.user_id !== user?.id) return;

      let change: BatchChange<T> | null = null;

      if (payload.eventType === "INSERT" && payload.new) {
        change = { type: "INSERT", record: payload.new as T };
      } else if (payload.eventType === "UPDATE" && payload.new) {
        change = { 
          type: "UPDATE", 
          record: payload.new as T,
          oldRecord: payload.old as T 
        };
      } else if (payload.eventType === "DELETE" && payload.old) {
        change = { type: "DELETE", record: payload.old as T };
      }

      if (change) {
        // Deduplicate: if same record ID already pending, replace it
        const existingIndex = pendingChangesRef.current.findIndex(
          (c) => c.record.id === change!.record.id
        );

        if (existingIndex >= 0) {
          // For deletes after insert/update, just keep the delete
          if (change.type === "DELETE") {
            const existing = pendingChangesRef.current[existingIndex];
            if (existing.type === "INSERT") {
              // Record was inserted then deleted - remove both
              pendingChangesRef.current.splice(existingIndex, 1);
            } else {
              pendingChangesRef.current[existingIndex] = change;
            }
          } else {
            // Update replaces previous change
            pendingChangesRef.current[existingIndex] = change;
          }
        } else {
          pendingChangesRef.current.push(change);
        }

        setPendingCount(pendingChangesRef.current.length);
        scheduleFlush();
      }
    },
    [user, scheduleFlush]
  );

  useEffect(() => {
    if (!enabled || !user) return;

    const channelName = `${table}-throttled-${user.id}`;

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
        console.log(`Throttled realtime subscription to ${table}:`, status);
      });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Flush any remaining changes on unmount
      if (pendingChangesRef.current.length > 0) {
        flushChanges();
      }
    };
  }, [table, user, enabled, handleChange, flushChanges]);

  // Allow immediate flush when needed
  const forceFlush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    flushChanges();
  }, [flushChanges]);

  return {
    isSubscribed: !!channelRef.current,
    pendingCount,
    forceFlush,
  };
}
