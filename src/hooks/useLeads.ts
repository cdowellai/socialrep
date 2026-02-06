import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type LeadInsert = TablesInsert<"leads">;
type LeadUpdate = TablesUpdate<"leads">;
type LeadStatus = Enums<"lead_status">;

interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  activity_type: string;
  content: string | null;
  old_status: string | null;
  new_status: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface LeadInteraction {
  id: string;
  lead_id: string;
  interaction_id: string;
  created_at: string;
  interaction?: Tables<"interactions">;
}

export interface LeadWithDetails extends Lead {
  activities?: LeadActivity[];
  linked_interactions?: LeadInteraction[];
}

export function useLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const fetchLeadDetails = useCallback(async (leadId: string): Promise<LeadWithDetails | null> => {
    if (!user) return null;

    try {
      // Fetch lead
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError) throw leadError;

      // Fetch activities
      const { data: activities } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      // Fetch linked interactions
      const { data: linkedInteractions } = await supabase
        .from("lead_interactions")
        .select("*, interaction:interactions(*)")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      return {
        ...lead,
        activities: activities as LeadActivity[] || [],
        linked_interactions: linkedInteractions as LeadInteraction[] || [],
      };
    } catch (err) {
      console.error("Error fetching lead details:", err);
      return null;
    }
  }, [user]);

  const createLead = async (lead: Omit<LeadInsert, "user_id">) => {
    if (!user) throw new Error("Not authenticated");

    // Generate random score breakdown
    const scoreBreakdown = {
      score_engagement: Math.floor(Math.random() * 30) + 10,
      score_sentiment: Math.floor(Math.random() * 25) + 5,
      score_profile: Math.floor(Math.random() * 25) + 5,
      score_recency: Math.floor(Math.random() * 30) + 10,
    };
    
    const totalScore = scoreBreakdown.score_engagement + 
      scoreBreakdown.score_sentiment + 
      scoreBreakdown.score_profile + 
      scoreBreakdown.score_recency;

    const { data, error } = await supabase
      .from("leads")
      .insert({ 
        ...lead, 
        user_id: user.id,
        score: totalScore,
        ...scoreBreakdown,
      })
      .select()
      .single();

    if (error) throw error;

    // Create "created" activity
    await supabase.from("lead_activities").insert({
      lead_id: data.id,
      user_id: user.id,
      activity_type: "created",
      content: "Lead created",
    });

    setLeads((prev) => [data, ...prev]);
    return data;
  };

  const updateLead = async (id: string, updates: LeadUpdate) => {
    if (!user) throw new Error("Not authenticated");

    const currentLead = leads.find((l) => l.id === id);
    
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // If status changed, create activity
    if (updates.status && currentLead && updates.status !== currentLead.status) {
      await supabase.from("lead_activities").insert({
        lead_id: id,
        user_id: user.id,
        activity_type: "status_change",
        old_status: currentLead.status,
        new_status: updates.status,
        content: `Status changed from ${currentLead.status} to ${updates.status}`,
      });
    }

    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)));
    return data;
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const addNote = async (leadId: string, content: string) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        user_id: user.id,
        activity_type: "note",
        content,
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({ title: "Note added", description: "Your note has been saved." });
    return data;
  };

  const linkInteraction = async (leadId: string, interactionId: string) => {
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("lead_interactions")
      .insert({
        lead_id: leadId,
        interaction_id: interactionId,
      });

    if (error) {
      if (error.code === "23505") {
        // Already linked
        return;
      }
      throw error;
    }

    // Create activity
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      user_id: user.id,
      activity_type: "interaction_linked",
      content: "New interaction linked to this lead",
      metadata: { interaction_id: interactionId },
    });
  };

  const convertInteractionToLead = async (interaction: Tables<"interactions">) => {
    if (!user) throw new Error("Not authenticated");

    // Generate score breakdown
    const scoreBreakdown = {
      score_engagement: Math.floor(Math.random() * 30) + 15,
      score_sentiment: interaction.sentiment === "positive" ? 25 : interaction.sentiment === "negative" ? 5 : 15,
      score_profile: interaction.author_name ? 20 : 10,
      score_recency: 25,
    };
    
    const totalScore = scoreBreakdown.score_engagement + 
      scoreBreakdown.score_sentiment + 
      scoreBreakdown.score_profile + 
      scoreBreakdown.score_recency;

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        user_id: user.id,
        contact_name: interaction.author_name || interaction.author_handle || "Unknown",
        source_platform: interaction.platform,
        source_interaction_id: interaction.id,
        status: "new",
        score: totalScore,
        ...scoreBreakdown,
      })
      .select()
      .single();

    if (error) throw error;

    // Link the interaction
    await supabase.from("lead_interactions").insert({
      lead_id: lead.id,
      interaction_id: interaction.id,
    });

    // Create activities
    await supabase.from("lead_activities").insert([
      {
        lead_id: lead.id,
        user_id: user.id,
        activity_type: "created",
        content: `Lead created from ${interaction.platform} ${interaction.interaction_type}`,
      },
      {
        lead_id: lead.id,
        user_id: user.id,
        activity_type: "interaction_linked",
        content: "Source interaction linked",
        metadata: { interaction_id: interaction.id },
      },
    ]);

    setLeads((prev) => [lead, ...prev]);
    toast({ 
      title: "Lead created", 
      description: `${interaction.author_name || "Unknown"} has been added as a new lead.` 
    });
    
    return lead;
  };

  // Stats calculation
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "lost").length,
    avgScore: leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
      : 0,
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    stats,
    refetch: fetchLeads,
    fetchLeadDetails,
    createLead,
    updateLead,
    deleteLead,
    addNote,
    linkInteraction,
    convertInteractionToLead,
  };
}
