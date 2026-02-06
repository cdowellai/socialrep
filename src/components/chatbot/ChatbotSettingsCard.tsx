import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, UserCheck, Users } from "lucide-react";

interface LocalSettings {
  widget_title: string;
  welcome_message: string;
  primary_color: string;
  position: "bottom-right" | "bottom-left";
  is_enabled: boolean;
  collect_email: boolean;
  collect_name: boolean;
  human_handoff_enabled: boolean;
}

interface ChatbotSettingsCardProps {
  localSettings: LocalSettings;
  settings: {
    widget_title: string;
    welcome_message: string;
    primary_color: string | null;
    position: "bottom-right" | "bottom-left";
  } | null;
  onSettingsChange: (updates: Partial<LocalSettings>) => void;
  onSave: () => void;
  saving: boolean;
}

export function ChatbotSettingsCard({
  localSettings,
  settings,
  onSettingsChange,
  onSave,
  saving,
}: ChatbotSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Widget Configuration
        </CardTitle>
        <CardDescription>
          Customize how your chatbot appears on your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled">Enable Chatbot</Label>
          <Switch
            id="enabled"
            checked={localSettings.is_enabled}
            onCheckedChange={(checked) => onSettingsChange({ is_enabled: checked })}
          />
        </div>

        {/* Basic Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={localSettings.widget_title || settings?.widget_title || ""}
              onChange={(e) => onSettingsChange({ widget_title: e.target.value })}
              placeholder="Chat with us"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome">Welcome Message</Label>
            <Textarea
              id="welcome"
              value={localSettings.welcome_message || settings?.welcome_message || ""}
              onChange={(e) => onSettingsChange({ welcome_message: e.target.value })}
              placeholder="Hi! How can I help you today?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={localSettings.primary_color || settings?.primary_color || "#3b82f6"}
                onChange={(e) => onSettingsChange({ primary_color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={localSettings.primary_color || settings?.primary_color || "#3b82f6"}
                onChange={(e) => onSettingsChange({ primary_color: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Widget Position</Label>
            <Select
              value={localSettings.position || settings?.position || "bottom-right"}
              onValueChange={(value: "bottom-right" | "bottom-left") =>
                onSettingsChange({ position: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Pre-chat Form Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Pre-Chat Form</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Collect visitor information before the chat starts
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="collect_name" className="text-sm">Collect visitor name</Label>
            <Switch
              id="collect_name"
              checked={localSettings.collect_name}
              onCheckedChange={(checked) => onSettingsChange({ collect_name: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="collect_email" className="text-sm">Collect visitor email</Label>
            <Switch
              id="collect_email"
              checked={localSettings.collect_email}
              onCheckedChange={(checked) => onSettingsChange({ collect_email: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Human Handoff Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Human Handoff</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, the bot will transfer conversations to your inbox when it can't answer or the visitor requests a human
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="human_handoff" className="text-sm">Enable Human Handoff</Label>
            <Switch
              id="human_handoff"
              checked={localSettings.human_handoff_enabled}
              onCheckedChange={(checked) => onSettingsChange({ human_handoff_enabled: checked })}
            />
          </div>

          {localSettings.human_handoff_enabled && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Handoff triggers:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Visitor says "speak to a human", "talk to agent", etc.</li>
                <li>Bot has low confidence in its response</li>
              </ul>
            </div>
          )}
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
