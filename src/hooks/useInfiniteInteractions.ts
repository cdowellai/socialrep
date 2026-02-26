import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useThrottledRealtime, type BatchChange } from "@/hooks/useThrottledRealtime";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

export interface InteractionFilters {
  platform?: Enums<"interaction_platform"> | "all";
  status?: Enums<"interaction_status"> | "all";
  sentiment?: Enums<"sentiment_type"> | "all";
  searchQuery?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

export interface InteractionCounts {
  total: number;
  pending: number;
  urgent: number;
  byPlatform: Record<string, number>;
  bySentiment: Record<string, number>;
}

const PAGE_SIZE = 50; // Increased for better virtual scroll performance
const MAX_CACHED_ITEMS = 1000; // Limit memory usage

export function useInfiniteInteractions() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InteractionFilters>({});
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [counts, setCounts] = useState<InteractionCounts>({
    total: 0,
    pending: 0,
    urgent: 0,
    byPlatform: {},
    bySentiment: {},
  });
  const pageRef = useRef(0);
  const lastFetchRef = useRef<number>(0);

  // Memoize expensive computations
  const displayStats = useMemo(() => ({
    loaded: interactions.length,
    ...counts,
  }), [interactions.length, counts]);

  // Fetch connected platforms so we only show messages for active connections
  const fetchConnectedPlatforms = useCallback(async () => {
    if (!user) {
      setConnectedPlatforms([]);
      return [];
    }
    try {
      const { data, error } = await supabase
        .from("connected_platforms")
        .select("platform")
        .eq("user_id", user.id);
      if (error) throw error;
      const platforms = (data || []).map((p) => p.platform);
      setConnectedPlatforms(platforms);
      return platforms;
    } catch (err) {
      console.error("Error fetching connected platforms:", err);
      return [];
    }
  }, [user]);

  // Subscribe to connected_platforms changes so inbox updates immediately on connect/disconnect
  useEffect(() => {
    if (!user) return;
    fetchConnectedPlatforms();

    const channel = supabase
      .channel(`connected_platforms_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "connected_platforms",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchConnectedPlatforms().then(() => {
            // Re-fetch interactions after platform change
            lastFetchRef.current = 0; // Reset debounce
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConnectedPlatforms]);

  const buildQuery = useCallback(
    (page: number, platforms: string[]) => {
      let query = supabase
        .from("interactions")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      // Only show interactions for currently connected platforms
      if (platforms.length > 0) {
        query = query.in("platform", platforms as Enums<"interaction_platform">[]);
      } else {
        // No platforms connected — return nothing by using an impossible filter
        query = query.in("platform", ["__none__"] as unknown as Enums<"interaction_platform">[]);
      }

      if (filters.platform && filters.platform !== "all") {
        query = query.eq("platform", filters.platform);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.sentiment && filters.sentiment !== "all") {
        query = query.eq("sentiment", filters.sentiment);
      }
      if (filters.searchQuery) {
        query = query.ilike("content", `%${filters.searchQuery}%`);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      return query;
    },
    [user, filters]
  );

  // Fetch counts separately for efficiency (doesn't load all data)
  const fetchCounts = useCallback(async (platforms?: string[]) => {
    if (!user) return;

    const activePlatforms = platforms ?? connectedPlatforms;

    try {
      if (activePlatforms.length === 0) {
        setCounts((prev) => ({ ...prev, total: 0, pending: 0, urgent: 0 }));
        return;
      }

      // Use count queries which are more efficient than fetching all data
      const platformsTyped = activePlatforms as Enums<"interaction_platform">[];
      const [totalRes, pendingRes, urgentRes] = await Promise.all([
        supabase
          .from("interactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("platform", platformsTyped),
        supabase
          .from("interactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("platform", platformsTyped)
          .eq("status", "pending"),
        supabase
          .from("interactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("platform", platformsTyped)
          .gte("urgency_score", 7),
      ]);

      setCounts((prev) => ({
        ...prev,
        total: totalRes.count || 0,
        pending: pendingRes.count || 0,
        urgent: urgentRes.count || 0,
      }));
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  }, [user, connectedPlatforms]);

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      setInteractions([]);
      setLoading(false);
      return;
    }

    // Debounce rapid fetches
    const now = Date.now();
    if (now - lastFetchRef.current < 500) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);
      pageRef.current = 0;

      // Always get fresh connected platforms before fetching
      const platforms = await fetchConnectedPlatforms();

      const [{ data, error: fetchError }] = await Promise.all([
        buildQuery(0, platforms),
        fetchCounts(platforms),
      ]);

      if (fetchError) throw fetchError;
      setInteractions(data || []);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch interactions");
      console.error("Error fetching interactions:", err);
    } finally {
      setLoading(false);
    }
  }, [user, buildQuery, fetchCounts, fetchConnectedPlatforms]);

  const loadMore = useCallback(async () => {
    if (!user || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      pageRef.current += 1;

      const { data, error: fetchError } = await buildQuery(pageRef.current, connectedPlatforms);

      if (fetchError) throw fetchError;

      setInteractions((prev) => {
        const newItems = [...prev, ...(data || [])];
        // Limit memory usage for very large datasets
        if (newItems.length > MAX_CACHED_ITEMS) {
          return newItems.slice(-MAX_CACHED_ITEMS);
        }
        return newItems;
      });
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
      console.error("Error loading more interactions:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [user, buildQuery, loadingMore, hasMore, connectedPlatforms]);

  // Handle batched realtime updates — only process if platform is still connected
  const handleBatchUpdate = useCallback((changes: BatchChange<Interaction>[]) => {
    setInteractions((prev) => {
      let updated = [...prev];

      for (const change of changes) {
        switch (change.type) {
          case "INSERT":
            // Only add if the platform is currently connected
            if (connectedPlatforms.includes(change.record.platform)) {
              updated = [change.record, ...updated];
            }
            break;
          case "UPDATE":
            updated = updated.map((i) =>
              i.id === change.record.id ? change.record : i
            );
            break;
          case "DELETE":
            updated = updated.filter((i) => i.id !== change.record.id);
            break;
        }
      }

      // Maintain memory limit
      if (updated.length > MAX_CACHED_ITEMS) {
        updated = updated.slice(0, MAX_CACHED_ITEMS);
      }

      return updated;
    });

    // Refresh counts on batch updates
    fetchCounts();
  }, [fetchCounts, connectedPlatforms]);

  // Use throttled realtime for high-volume scenarios
  const { pendingCount, forceFlush } = useThrottledRealtime<Interaction>({
    table: "interactions",
    onBatchUpdate: handleBatchUpdate,
    throttleMs: 2000, // 2 second batching
    enabled: !!user,
  });

  const updateInteraction = async (id: string, updates: Partial<Interaction>) => {
    const { data, error } = await supabase
      .from("interactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setInteractions((prev) => prev.map((i) => (i.id === id ? data : i)));
    return data;
  };

  const bulkUpdateInteractions = async (ids: string[], updates: Partial<Interaction>) => {
    const { data, error } = await supabase
      .from("interactions")
      .update(updates)
      .in("id", ids)
      .select();

    if (error) throw error;
    setInteractions((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, ...updates } : i))
    );
    fetchCounts(); // Refresh counts after bulk update
    return data;
  };

  const deleteInteraction = async (id: string) => {
    const { error } = await supabase.from("interactions").delete().eq("id", id);
    if (error) throw error;
    setInteractions((prev) => prev.filter((i) => i.id !== id));
    fetchCounts();
  };

  const bulkDeleteInteractions = async (ids: string[]) => {
    const { error } = await supabase.from("interactions").delete().in("id", ids);
    if (error) throw error;
    setInteractions((prev) => prev.filter((i) => !ids.includes(i.id)));
    fetchCounts();
  };

  const applyFilters = useCallback((newFilters: InteractionFilters) => {
    setFilters(newFilters);
  }, []);

  // Re-fetch when filters change
  const refetchWithFilters = useCallback(async () => {
    await fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    counts: displayStats,
    connectedPlatforms,
    pendingRealtimeCount: pendingCount,
    refetch: fetchInteractions,
    loadMore,
    updateInteraction,
    bulkUpdateInteractions,
    deleteInteraction,
    bulkDeleteInteractions,
    applyFilters,
    refetchWithFilters,
    forceRealtimeFlush: forceFlush,
    totalLoaded: interactions.length,
  };
}
