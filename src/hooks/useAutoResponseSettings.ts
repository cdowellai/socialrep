import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AutoResponseSettings {
  auto_respond_comments: boolean;
  auto_respond_messages: boolean;
  auto_respond_reviews: boolean;
  auto_respond_chatbot: boolean;
  auto_response_delay_ms: number;
}

export function useAutoResponseSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutoResponseSettings>({
    auto_respond_comments: false,
    auto_respond_messages: false,
    auto_respond_reviews: false,
    auto_respond_chatbot: true,
    auto_response_delay_ms: 30000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("auto_respond_comments, auto_respond_messages, auto_respond_reviews, auto_respond_chatbot, auto_response_delay_ms")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          auto_respond_comments: data.auto_respond_comments ?? false,
          auto_respond_messages: data.auto_respond_messages ?? false,
          auto_respond_reviews: data.auto_respond_reviews ?? false,
          auto_respond_chatbot: data.auto_respond_chatbot ?? true,
          auto_response_delay_ms: data.auto_response_delay_ms ?? 30000,
        });
      }
    } catch (error) {
      console.error("Error fetching auto-response settings:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    async (key: keyof AutoResponseSettings, value: boolean | number) => {
      if (!user?.id) return;

      setSaving(true);
      const previousSettings = { ...settings };
      
      // Optimistic update
      setSettings((prev) => ({ ...prev, [key]: value }));

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ [key]: value, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (error) throw error;

        const isDelayUpdate = key === "auto_response_delay_ms";
        const delayValue = value as number;
        const delaySeconds = Math.round(delayValue / 1000);
        const delayMinutes = Math.floor(delaySeconds / 60);
        const remainingSeconds = delaySeconds % 60;
        const delayDisplay = delayMinutes > 0 
          ? `${delayMinutes}m ${remainingSeconds}s` 
          : `${delaySeconds}s`;
        toast({
          title: "Setting updated",
          description: isDelayUpdate 
            ? `Response delay set to ${delayDisplay}`
            : `Auto-response ${value ? "enabled" : "disabled"}`,
        });
      } catch (error) {
        console.error("Error updating auto-response setting:", error);
        setSettings(previousSettings);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update setting",
        });
      } finally {
        setSaving(false);
      }
    },
    [user?.id, settings, toast]
  );

  return {
    settings,
    loading,
    saving,
    updateSetting,
    refetch: fetchSettings,
  };
}
