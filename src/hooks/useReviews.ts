import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Review = Tables<"reviews">;
type ReviewInsert = TablesInsert<"reviews">;
type ReviewUpdate = TablesUpdate<"reviews">;

export function useReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createReview = async (review: Omit<ReviewInsert, "user_id">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("reviews")
      .insert({ ...review, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setReviews((prev) => [data, ...prev]);
    return data;
  };

  const updateReview = async (id: string, updates: ReviewUpdate) => {
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setReviews((prev) => prev.map((r) => (r.id === id ? data : r)));
    return data;
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
  };
}
