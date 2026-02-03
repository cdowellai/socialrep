import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: "sentiment" | "keyword" | "platform" | "time_based";
  trigger_conditions: {
    sentiment_threshold?: number;
    sentiment_type?: "positive" | "neutral" | "negative";
    keywords?: string[];
    platforms?: string[];
    time_window?: { start: string; end: string };
  };
  action_type: "auto_respond" | "escalate" | "archive" | "notify" | "tag";
  action_config: {
    response_template?: string;
    notify_email?: string;
    tags?: string[];
    escalate_to?: string;
  };
  priority: number;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

type AutomationRuleInsert = Omit<AutomationRule, "id" | "created_at" | "updated_at" | "execution_count" | "last_executed_at">;

export function useAutomationRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    if (!user) {
      setRules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: false });

      if (fetchError) throw fetchError;
      setRules((data || []) as AutomationRule[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rules");
      console.error("Error fetching automation rules:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createRule = async (rule: Omit<AutomationRuleInsert, "user_id">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("automation_rules")
      .insert({
        ...rule,
        user_id: user.id,
        trigger_conditions: rule.trigger_conditions as any,
        action_config: rule.action_config as any,
      })
      .select()
      .single();

    if (error) throw error;
    setRules((prev) => [data as AutomationRule, ...prev]);
    return data as AutomationRule;
  };

  const updateRule = async (id: string, updates: Partial<AutomationRule>) => {
    const { data, error } = await supabase
      .from("automation_rules")
      .update({
        ...updates,
        trigger_conditions: updates.trigger_conditions as any,
        action_config: updates.action_config as any,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setRules((prev) => prev.map((r) => (r.id === id ? (data as AutomationRule) : r)));
    return data as AutomationRule;
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from("automation_rules").delete().eq("id", id);
    if (error) throw error;
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRule = async (id: string, is_active: boolean) => {
    return updateRule(id, { is_active });
  };

  // Execute matching rules for an interaction
  const evaluateRules = async (interaction: {
    sentiment: string | null;
    sentiment_score: number | null;
    platform: string;
    content: string;
  }) => {
    const activeRules = rules.filter((r) => r.is_active);
    const matchingRules: AutomationRule[] = [];

    for (const rule of activeRules) {
      let matches = false;

      switch (rule.trigger_type) {
        case "sentiment":
          if (rule.trigger_conditions.sentiment_type === interaction.sentiment) {
            matches = true;
          }
          if (rule.trigger_conditions.sentiment_threshold && interaction.sentiment_score) {
            matches = interaction.sentiment_score >= rule.trigger_conditions.sentiment_threshold;
          }
          break;

        case "keyword":
          if (rule.trigger_conditions.keywords?.length) {
            const lowerContent = interaction.content.toLowerCase();
            matches = rule.trigger_conditions.keywords.some((kw) =>
              lowerContent.includes(kw.toLowerCase())
            );
          }
          break;

        case "platform":
          if (rule.trigger_conditions.platforms?.length) {
            matches = rule.trigger_conditions.platforms.includes(interaction.platform);
          }
          break;
      }

      if (matches) {
        matchingRules.push(rule);
      }
    }

    // Sort by priority and return
    return matchingRules.sort((a, b) => b.priority - a.priority);
  };

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    rules,
    loading,
    error,
    refetch: fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    evaluateRules,
  };
}
