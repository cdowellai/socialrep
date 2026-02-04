import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ChatbotSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  widget_title: string;
  welcome_message: string;
  primary_color: string | null;
  position: "bottom-right" | "bottom-left";
  collect_email: boolean;
  collect_name: boolean;
  auto_reply_delay_ms: number;
}

const defaultSettings: Omit<ChatbotSettings, "id" | "user_id"> = {
  is_enabled: true,
  widget_title: "Chat with us",
  welcome_message: "Hi! How can I help you today?",
  primary_color: "#3b82f6",
  position: "bottom-right",
  collect_email: false,
  collect_name: false,
  auto_reply_delay_ms: 1000,
};

export function useChatbotSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as ChatbotSettings);
      } else {
        // Create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from("chatbot_settings")
          .insert({ user_id: user.id, ...defaultSettings })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings as ChatbotSettings);
      }
    } catch (error) {
      console.error("Error fetching chatbot settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chatbot settings",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<Omit<ChatbotSettings, "id" | "user_id">>) => {
      if (!settings?.id) return;

      setSaving(true);
      try {
        const { data, error } = await supabase
          .from("chatbot_settings")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;

        setSettings(data as ChatbotSettings);
        toast({
          title: "Settings saved",
          description: "Your chatbot settings have been updated",
        });
      } catch (error) {
        console.error("Error updating chatbot settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save chatbot settings",
        });
      } finally {
        setSaving(false);
      }
    },
    [settings?.id, toast]
  );

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings,
  };
}
