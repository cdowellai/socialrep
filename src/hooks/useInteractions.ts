import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_INTERACTIONS } from "@/lib/demoData";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;
type InteractionInsert = TablesInsert<"interactions">;
type InteractionUpdate = TablesUpdate<"interactions">;

export function useInteractions() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetchInteractions = useCallback(async () => {
    if (!user) {
      setInteractions(DEMO_INTERACTIONS);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("interactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        setInteractions(data);
        setIsDemo(false);
      } else {
        setInteractions(DEMO_INTERACTIONS);
        setIsDemo(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch interactions");
      console.error("Error fetching interactions:", err);
      setInteractions(DEMO_INTERACTIONS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createInteraction = async (interaction: Omit<InteractionInsert, "user_id">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("interactions")
      .insert({ ...interaction, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setInteractions((prev) => [data, ...prev]);
    return data;
  };

  const updateInteraction = async (id: string, updates: InteractionUpdate) => {
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

  const deleteInteraction = async (id: string) => {
    const { error } = await supabase.from("interactions").delete().eq("id", id);
    if (error) throw error;
    setInteractions((prev) => prev.filter((i) => i.id !== id));
  };

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    loading,
    error,
    isDemo,
    refetch: fetchInteractions,
    createInteraction,
    updateInteraction,
    deleteInteraction,
  };
}
