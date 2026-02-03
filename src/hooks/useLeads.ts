import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type LeadInsert = TablesInsert<"leads">;
type LeadUpdate = TablesUpdate<"leads">;

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createLead = async (lead: Omit<LeadInsert, "user_id">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("leads")
      .insert({ ...lead, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setLeads((prev) => [data, ...prev]);
    return data;
  };

  const updateLead = async (id: string, updates: LeadUpdate) => {
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)));
    return data;
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}
