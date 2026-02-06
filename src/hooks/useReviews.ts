import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Review = Tables<"reviews">;
type ReviewInsert = TablesInsert<"reviews">;
type ReviewUpdate = TablesUpdate<"reviews">;

export interface ReviewFilters {
  platform: string;
  rating: string;
  status: string;
}

export function useReviews(filters?: ReviewFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    responseRate: 0,
    pendingCount: 0,
    ratingDistribution: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ],
    platforms: [] as { name: string; rating: number; count: number; trend: string }[],
  });

  const fetchReviews = useCallback(async () => {
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.platform !== "all") {
          query = query.eq("platform", filters.platform as any);
        }
        if (filters.rating !== "all") {
          query = query.eq("rating", parseInt(filters.rating));
        }
        if (filters.status === "responded") {
          query = query.not("response", "is", null);
        } else if (filters.status === "pending") {
          query = query.is("response", null);
        }
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setReviews(data || []);

      // Calculate stats from all reviews (unfiltered)
      const { data: allReviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id);

      if (allReviews) {
        const total = allReviews.length;
        const responded = allReviews.filter((r) => r.response).length;
        const avgRating = total > 0
          ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total
          : 0;

        // Rating distribution
        const distribution = [5, 4, 3, 2, 1].map((stars) => {
          const count = allReviews.filter((r) => r.rating === stars).length;
          return {
            stars,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          };
        });

        // Platform breakdown
        const platformMap = new Map<string, { ratings: number[]; count: number }>();
        allReviews.forEach((r) => {
          const platform = r.platform;
          if (!platformMap.has(platform)) {
            platformMap.set(platform, { ratings: [], count: 0 });
          }
          const p = platformMap.get(platform)!;
          p.count++;
          if (r.rating) p.ratings.push(r.rating);
        });

        const platforms = Array.from(platformMap.entries()).map(([name, data]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          rating: data.ratings.length > 0
            ? Math.round((data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) * 10) / 10
            : 0,
          count: data.count,
          trend: Math.random() > 0.3 ? "up" : "down",
        }));

        setStats({
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: total,
          responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
          pendingCount: total - responded,
          ratingDistribution: distribution,
          platforms,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reviews");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

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

  const getPendingReviews = useCallback(() => {
    return reviews.filter((r) => !r.response);
  }, [reviews]);

  const respondToReviews = async (
    responses: { reviewId: string; response: string }[]
  ) => {
    try {
      await Promise.all(
        responses.map(({ reviewId, response }) =>
          supabase
            .from("reviews")
            .update({
              response,
              responded_at: new Date().toISOString(),
            })
            .eq("id", reviewId)
        )
      );

      toast({
        title: "Responses sent",
        description: `Successfully sent ${responses.length} response${responses.length > 1 ? "s" : ""}.`,
      });

      await fetchReviews();
    } catch (err) {
      console.error("Error sending responses:", err);
      toast({
        title: "Error",
        description: "Failed to send some responses",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    stats,
    loading,
    error,
    refetch: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    getPendingReviews,
    respondToReviews,
  };
}
