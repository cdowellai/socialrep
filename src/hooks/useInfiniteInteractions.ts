import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

const PAGE_SIZE = 20;

export function useInfiniteInteractions() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InteractionFilters>({});
  const pageRef = useRef(0);

  const buildQuery = useCallback(
    (page: number) => {
      let query = supabase
        .from("interactions")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

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

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      setInteractions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      pageRef.current = 0;

      const { data, error: fetchError } = await buildQuery(0);

      if (fetchError) throw fetchError;
      setInteractions(data || []);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch interactions");
      console.error("Error fetching interactions:", err);
    } finally {
      setLoading(false);
    }
  }, [user, buildQuery]);

  const loadMore = useCallback(async () => {
    if (!user || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      pageRef.current += 1;

      const { data, error: fetchError } = await buildQuery(pageRef.current);

      if (fetchError) throw fetchError;
      
      setInteractions((prev) => [...prev, ...(data || [])]);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
      console.error("Error loading more interactions:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [user, buildQuery, loadingMore, hasMore]);

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
    return data;
  };

  const deleteInteraction = async (id: string) => {
    const { error } = await supabase.from("interactions").delete().eq("id", id);
    if (error) throw error;
    setInteractions((prev) => prev.filter((i) => i.id !== id));
  };

  const bulkDeleteInteractions = async (ids: string[]) => {
    const { error } = await supabase.from("interactions").delete().in("id", ids);
    if (error) throw error;
    setInteractions((prev) => prev.filter((i) => !ids.includes(i.id)));
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
    refetch: fetchInteractions,
    loadMore,
    updateInteraction,
    bulkUpdateInteractions,
    deleteInteraction,
    bulkDeleteInteractions,
    applyFilters,
    refetchWithFilters,
    totalLoaded: interactions.length,
  };
}
