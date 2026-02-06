import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Smartphone, MessageSquare, Save, Star, AlertTriangle, ExternalLink } from "lucide-react";

interface NotificationSettings {
  notify_urgent_interactions: boolean;
  notify_reviews_below_stars: number;
  notify_daily_digest: boolean;
  notify_browser_push: boolean;
  notify_slack_enabled: boolean;
  notify_slack_webhook_url: string | null;
}

export function NotificationsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    notify_urgent_interactions: true,
    notify_reviews_below_stars: 3,
    notify_daily_digest: true,
    notify_browser_push: false,
    notify_slack_enabled: false,
    notify_slack_webhook_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          notify_urgent_interactions,
          notify_reviews_below_stars,
          notify_daily_digest,
          notify_browser_push,
          notify_slack_enabled,
          notify_slack_webhook_url
        `)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          notify_urgent_interactions: data.notify_urgent_interactions ?? true,
          notify_reviews_below_stars: data.notify_reviews_below_stars ?? 3,
          notify_daily_digest: data.notify_daily_digest ?? true,
          notify_browser_push: data.notify_browser_push ?? false,
          notify_slack_enabled: data.notify_slack_enabled ?? false,
          notify_slack_webhook_url: data.notify_slack_webhook_url || "",
        });
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          notify_urgent_interactions: settings.notify_urgent_interactions,
          notify_reviews_below_stars: settings.notify_reviews_below_stars,
          notify_daily_digest: settings.notify_daily_digest,
          notify_browser_push: settings.notify_browser_push,
          notify_slack_enabled: settings.notify_slack_enabled,
          notify_slack_webhook_url: settings.notify_slack_webhook_url || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Settings saved", description: "Your notification preferences have been updated." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not supported",
        description: "Browser notifications are not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setSettings({ ...settings, notify_browser_push: true });
      toast({ title: "Enabled", description: "Browser notifications have been enabled." });
    } else {
      toast({
        title: "Permission denied",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>Configure when to receive email alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Urgent Interactions</Label>
                <Badge variant="outline" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  High Priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified when interactions have high urgency scores
              </p>
            </div>
            <Switch
              checked={settings.notify_urgent_interactions}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notify_urgent_interactions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>New Reviews Below</Label>
                <Select
                  value={settings.notify_reviews_below_stars.toString()}
                  onValueChange={(v) =>
                    setSettings({ ...settings, notify_reviews_below_stars: parseInt(v) })
                  }
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4 stars</SelectItem>
                    <SelectItem value="3">3 stars</SelectItem>
                    <SelectItem value="2">2 stars</SelectItem>
                    <SelectItem value="1">1 star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Get alerted when new reviews are below this rating
              </p>
            </div>
            <Star className="h-5 w-5 text-sentiment-neutral" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Digest Email</Label>
              <p className="text-sm text-muted-foreground">
                Receive a daily summary of all interactions and metrics
              </p>
            </div>
            <Switch
              checked={settings.notify_daily_digest}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notify_daily_digest: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Browser Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Browser Notifications
          </CardTitle>
          <CardDescription>Get real-time alerts in your browser</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications for new interactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!settings.notify_browser_push && (
                <Button variant="outline" size="sm" onClick={requestBrowserNotifications}>
                  Enable
                </Button>
              )}
              <Switch
                checked={settings.notify_browser_push}
                onCheckedChange={(checked) => {
                  if (checked) {
                    requestBrowserNotifications();
                  } else {
                    setSettings({ ...settings, notify_browser_push: false });
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Slack Integration
          </CardTitle>
          <CardDescription>Send notifications to your Slack workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Slack Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Post notifications to a Slack channel
              </p>
            </div>
            <Switch
              checked={settings.notify_slack_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notify_slack_enabled: checked })
              }
            />
          </div>

          {settings.notify_slack_enabled && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                type="url"
                value={settings.notify_slack_webhook_url || ""}
                onChange={(e) =>
                  setSettings({ ...settings, notify_slack_webhook_url: e.target.value })
                }
                placeholder="https://hooks.slack.com/services/..."
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn how to create a Slack webhook
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Saving..." : "Save Notification Settings"}
      </Button>
    </div>
  );
}
