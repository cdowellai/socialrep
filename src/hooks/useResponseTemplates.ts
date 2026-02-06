import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ResponseTemplate {
  id: string;
  user_id: string;
  name: string;
  template: string;
  category: string | null;
  variables: string[];
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useResponseTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("response_templates")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (
    name: string,
    template: string,
    category?: string
  ) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("response_templates")
      .insert({
        user_id: user.id,
        name,
        template,
        category: category || null,
        variables: extractVariables(template),
      })
      .select()
      .single();

    if (error) throw error;
    setTemplates((prev) => [data, ...prev]);
    toast({
      title: "Template created",
      description: `"${name}" has been saved.`,
    });
    return data;
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<Pick<ResponseTemplate, "name" | "template" | "category">>
  ) => {
    const { data, error } = await supabase
      .from("response_templates")
      .update({
        ...updates,
        variables: updates.template ? extractVariables(updates.template) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setTemplates((prev) => prev.map((t) => (t.id === id ? data : t)));
    toast({
      title: "Template updated",
      description: "Your changes have been saved.",
    });
    return data;
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from("response_templates")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Template deleted",
      description: "The template has been removed.",
    });
  };

  const useTemplate = async (id: string) => {
    // Increment usage count locally
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, usage_count: t.usage_count + 1 } : t))
    );

    // Update in database (fire and forget)
    const template = templates.find((t) => t.id === id);
    if (template) {
      supabase
        .from("response_templates")
        .update({ usage_count: template.usage_count + 1 })
        .eq("id", id)
        .then(() => {});
    }
  };

  return {
    templates,
    loading,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
  };
}

// Helper to extract {{variable}} patterns from template
function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
}
