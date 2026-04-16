import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, UserCheck, Users, Loader2, Target, Clock } from "lucide-react";

interface LocalSettings {
  widget_title: string;
  welcome_message: string;
  primary_color: string;
  position: "bottom-right" | "bottom-left";
  is_enabled: boolean;
  collect_email: boolean;
  collect_name: boolean;
  human_handoff_enabled: boolean;
  booking_url: string;
  pricing_url: string;
  sales_goal: "purchase" | "book_meeting" | "capture_lead" | "all";
  humanize_typing: boolean;
  typing_chars_per_second: number;
  max_typing_delay_ms: number;
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

export function ChatbotSettingsCard({ localSettings, settings, onSettingsChange, onSave, saving }: ChatbotSettingsCardProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight">Widget Configuration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Customize appearance and behavior</p>
        </div>
      </div>

      {/* Enable */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
        <div>
          <Label htmlFor="enabled" className="text-sm font-medium">Enable Chatbot</Label>
          <p className="text-xs text-muted-foreground">Show widget on your website</p>
        </div>
        <Switch id="enabled" checked={localSettings.is_enabled} onCheckedChange={(checked) => onSettingsChange({ is_enabled: checked })} />
      </div>

      {/* Basic */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Widget Title</Label>
          <Input id="title" value={localSettings.widget_title || settings?.widget_title || ""} onChange={(e) => onSettingsChange({ widget_title: e.target.value })} placeholder="Chat with us" className="rounded-xl bg-muted/30 border-border/30" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Welcome Message</Label>
          <Textarea id="welcome" value={localSettings.welcome_message || settings?.welcome_message || ""} onChange={(e) => onSettingsChange({ welcome_message: e.target.value })} placeholder="Hi! How can I help you today?" rows={3} className="rounded-xl bg-muted/30 border-border/30" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Brand Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={localSettings.primary_color || settings?.primary_color || "#3b82f6"} onChange={(e) => onSettingsChange({ primary_color: e.target.value })} className="w-12 h-10 p-1 cursor-pointer rounded-lg" />
              <Input value={localSettings.primary_color || settings?.primary_color || "#3b82f6"} onChange={(e) => onSettingsChange({ primary_color: e.target.value })} className="flex-1 rounded-xl bg-muted/30 border-border/30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</Label>
            <Select value={localSettings.position || settings?.position || "bottom-right"} onValueChange={(v: "bottom-right" | "bottom-left") => onSettingsChange({ position: v })}>
              <SelectTrigger className="rounded-xl bg-muted/30 border-border/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Pre-Chat */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Visitor Identification</Label>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <Label htmlFor="collect_name" className="text-sm">Collect name</Label>
          <Switch id="collect_name" checked={localSettings.collect_name} onCheckedChange={(checked) => onSettingsChange({ collect_name: checked })} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <Label htmlFor="collect_email" className="text-sm">Collect email</Label>
          <Switch id="collect_email" checked={localSettings.collect_email} onCheckedChange={(checked) => onSettingsChange({ collect_email: checked })} />
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Human Handoff */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Human Handoff</Label>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <div>
            <Label htmlFor="human_handoff" className="text-sm">Enable escalation</Label>
            <p className="text-xs text-muted-foreground">Transfer to your inbox when needed</p>
          </div>
          <Switch id="human_handoff" checked={localSettings.human_handoff_enabled} onCheckedChange={(checked) => onSettingsChange({ human_handoff_enabled: checked })} />
        </div>
        {localSettings.human_handoff_enabled && (
          <div className="rounded-xl bg-accent/30 border border-accent/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Triggers automatically when:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Visitor requests to speak with a person</li>
              <li>AI has low confidence in its response</li>
            </ul>
          </div>
        )}
      </div>

      <div className="h-px bg-border/50" />

      {/* Sales Goals */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Sales Goals</Label>
        </div>
        <p className="text-xs text-muted-foreground">Tell the bot what to push visitors toward.</p>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Primary Conversion Goal</Label>
          <Select
            value={localSettings.sales_goal || "all"}
            onValueChange={(v: "purchase" | "book_meeting" | "capture_lead" | "all") => onSettingsChange({ sales_goal: v })}
          >
            <SelectTrigger className="rounded-xl bg-muted/30 border-border/30"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mixed — let the bot decide</SelectItem>
              <SelectItem value="purchase">Drive purchases</SelectItem>
              <SelectItem value="book_meeting">Book a meeting</SelectItem>
              <SelectItem value="capture_lead">Capture lead (name + email)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricing_url" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pricing / Checkout URL</Label>
          <Input
            id="pricing_url"
            type="url"
            value={localSettings.pricing_url || ""}
            onChange={(e) => onSettingsChange({ pricing_url: e.target.value })}
            placeholder="https://yoursite.com/pricing"
            className="rounded-xl bg-muted/30 border-border/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking_url" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Booking URL</Label>
          <Input
            id="booking_url"
            type="url"
            value={localSettings.booking_url || ""}
            onChange={(e) => onSettingsChange({ booking_url: e.target.value })}
            placeholder="https://calendly.com/your-team"
            className="rounded-xl bg-muted/30 border-border/30"
          />
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Response Timing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Response Timing</Label>
        </div>
        <p className="text-xs text-muted-foreground">Make replies feel more human by scaling delay with response length.</p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <div>
            <Label htmlFor="humanize" className="text-sm">Humanize response timing</Label>
            <p className="text-xs text-muted-foreground">Longer replies take longer to send</p>
          </div>
          <Switch
            id="humanize"
            checked={localSettings.humanize_typing}
            onCheckedChange={(checked) => onSettingsChange({ humanize_typing: checked })}
          />
        </div>

        {localSettings.humanize_typing && (
          <>
            <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Typing speed</Label>
                <span className="text-xs font-medium tabular-nums">
                  {localSettings.typing_chars_per_second} chars/sec
                </span>
              </div>
              <Slider
                min={10}
                max={60}
                step={5}
                value={[localSettings.typing_chars_per_second]}
                onValueChange={([v]) => onSettingsChange({ typing_chars_per_second: v })}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Slow / thoughtful</span>
                <span>Natural</span>
                <span>Fast</span>
              </div>
            </div>

            <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Max delay cap</Label>
                <span className="text-xs font-medium tabular-nums">
                  {(localSettings.max_typing_delay_ms / 1000).toFixed(1)}s
                </span>
              </div>
              <Slider
                min={2000}
                max={15000}
                step={500}
                value={[localSettings.max_typing_delay_ms]}
                onValueChange={([v]) => onSettingsChange({ max_typing_delay_ms: v })}
              />
            </div>

            <div className="rounded-xl bg-accent/30 border border-accent/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Preview</p>
              <p>
                A 200-character reply will appear after ~
                <span className="font-semibold text-foreground tabular-nums">
                  {Math.min(
                    localSettings.max_typing_delay_ms / 1000,
                    200 / Math.max(1, localSettings.typing_chars_per_second)
                  ).toFixed(1)}s
                </span>
                {" "}of "typing…"
              </p>
            </div>
          </>
        )}
      </div>

      <Button onClick={onSave} disabled={saving} className="w-full rounded-xl h-11">
        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Settings"}
      </Button>
    </div>
  );
}
