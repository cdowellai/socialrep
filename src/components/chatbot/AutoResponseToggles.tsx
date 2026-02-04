import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAutoResponseSettings } from "@/hooks/useAutoResponseSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, MessageSquare, MessageCircle, Star, Clock } from "lucide-react";

export function AutoResponseToggles() {
  const { settings, loading, saving, updateSetting } = useAutoResponseSettings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const toggleItems = [
    {
      key: "auto_respond_chatbot" as const,
      label: "Website Chatbot",
      description: "Automatically respond to visitors on your embedded chatbot",
      icon: Bot,
    },
    {
      key: "auto_respond_comments" as const,
      label: "Comments",
      description: "Auto-respond to comments on social media posts",
      icon: MessageCircle,
    },
    {
      key: "auto_respond_messages" as const,
      label: "Direct Messages",
      description: "Auto-respond to DMs across connected platforms",
      icon: MessageSquare,
    },
    {
      key: "auto_respond_reviews" as const,
      label: "Reviews",
      description: "Auto-respond to customer reviews",
      icon: Star,
    },
  ];

  const delaySeconds = Math.round(settings.auto_response_delay_ms / 1000);
  const delayMinutes = Math.floor(delaySeconds / 60);
  const remainingSeconds = delaySeconds % 60;
  const delayDisplay = delayMinutes > 0 
    ? `${delayMinutes}m ${remainingSeconds}s` 
    : `${delaySeconds}s`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Auto-Response Settings
        </CardTitle>
        <CardDescription>
          Control which interaction types receive automatic AI responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Response Delay Setting */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-0.5">
              <Label className="text-sm font-medium">Response Delay</Label>
              <p className="text-xs text-muted-foreground">
                Add a delay before auto-responses to feel more human
              </p>
            </div>
            <span className="text-sm font-medium tabular-nums min-w-[4rem] text-right">
              {delayDisplay}
            </span>
          </div>
          <div className="px-1">
            <Slider
              value={[settings.auto_response_delay_ms]}
              onValueChange={([value]) => updateSetting("auto_response_delay_ms", value)}
              min={30000}
              max={120000}
              step={5000}
              disabled={saving}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30 seconds</span>
              <span>2 minutes</span>
            </div>
          </div>
        </div>

        {/* Toggle Items */}
        {toggleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor={item.key} className="text-sm font-medium">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={settings[item.key]}
              onCheckedChange={(checked) => updateSetting(item.key, checked)}
              disabled={saving}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
