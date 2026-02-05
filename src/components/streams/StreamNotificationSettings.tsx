import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, BellOff, Settings } from "lucide-react";
import type { Stream } from "@/hooks/useStreams";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StreamNotificationSettingsProps {
  stream: Stream;
  onUpdate: (updates: Partial<Stream>) => void;
}

export function StreamNotificationSettings({
  stream,
  onUpdate,
}: StreamNotificationSettingsProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (
    key: "notifications_enabled" | "notifications_muted",
    value: boolean
  ) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("streams")
        .update({ [key]: value })
        .eq("id", stream.id);

      if (error) throw error;

      onUpdate({ [key]: value });

      toast({
        title: "Settings updated",
        description: `Notifications ${
          key === "notifications_muted"
            ? value
              ? "muted"
              : "unmuted"
            : value
            ? "enabled"
            : "disabled"
        }.`,
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isMuted = stream.notifications_muted;
  const isEnabled = stream.notifications_enabled;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Notification settings">
          {isMuted ? (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Notifications</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Show badges for new items
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) =>
                  handleToggle("notifications_enabled", checked)
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Mute Stream</Label>
                <p className="text-xs text-muted-foreground">
                  Hide all notification badges
                </p>
              </div>
              <Switch
                checked={isMuted}
                onCheckedChange={(checked) =>
                  handleToggle("notifications_muted", checked)
                }
                disabled={saving || !isEnabled}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
