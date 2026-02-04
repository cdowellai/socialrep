import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import { AutoResponseToggles } from "@/components/chatbot/AutoResponseToggles";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Code, MessageSquare, Settings, Eye, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ChatbotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, loading, saving, updateSettings } = useChatbotSettings();
  const [localSettings, setLocalSettings] = useState({
    widget_title: "",
    welcome_message: "",
    primary_color: "",
    position: "bottom-right" as "bottom-right" | "bottom-left",
    is_enabled: true,
    collect_email: false,
    collect_name: false,
  });

  // Sync local state with fetched settings
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        widget_title: settings.widget_title,
        welcome_message: settings.welcome_message,
        primary_color: settings.primary_color || "#3b82f6",
        position: settings.position,
        is_enabled: settings.is_enabled,
        collect_email: settings.collect_email,
        collect_name: settings.collect_name,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const embedCode = `<!-- SocialRep AI Chatbot Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/chatbot-widget.js';
    script.setAttribute('data-user-id', '${user?.id || "YOUR_USER_ID"}');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[500px]" />
            <Skeleton className="h-[500px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displaySettings = settings
    ? {
        widget_title: localSettings.widget_title || settings.widget_title,
        welcome_message: localSettings.welcome_message || settings.welcome_message,
        primary_color: localSettings.primary_color || settings.primary_color || "#3b82f6",
        position: localSettings.position || settings.position,
      }
    : localSettings;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Chatbot</h1>
          <p className="text-muted-foreground">
            Add an AI-powered chatbot to your website using your brand voice
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="auto-response" className="gap-2">
              <Bot className="h-4 w-4" />
              Auto-Response
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-2">
              <Code className="h-4 w-4" />
              Embed Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
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
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Enable Chatbot</Label>
                    <Switch
                      id="enabled"
                      checked={localSettings.is_enabled}
                      onCheckedChange={(checked) =>
                        setLocalSettings((s) => ({ ...s, is_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Widget Title</Label>
                    <Input
                      id="title"
                      value={localSettings.widget_title || settings?.widget_title || ""}
                      onChange={(e) =>
                        setLocalSettings((s) => ({ ...s, widget_title: e.target.value }))
                      }
                      placeholder="Chat with us"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome">Welcome Message</Label>
                    <Textarea
                      id="welcome"
                      value={localSettings.welcome_message || settings?.welcome_message || ""}
                      onChange={(e) =>
                        setLocalSettings((s) => ({ ...s, welcome_message: e.target.value }))
                      }
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
                        onChange={(e) =>
                          setLocalSettings((s) => ({ ...s, primary_color: e.target.value }))
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={localSettings.primary_color || settings?.primary_color || "#3b82f6"}
                        onChange={(e) =>
                          setLocalSettings((s) => ({ ...s, primary_color: e.target.value }))
                        }
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
                        setLocalSettings((s) => ({ ...s, position: value }))
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

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See how your chatbot will look to visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-muted/30 min-h-[450px]">
                    <ChatbotWidget
                      title={displaySettings.widget_title}
                      welcomeMessage={displaySettings.welcome_message}
                      primaryColor={displaySettings.primary_color}
                      position={displaySettings.position}
                      isPreview
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="auto-response">
            <AutoResponseToggles />
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Full Preview</CardTitle>
                <CardDescription>
                  Test your chatbot with real AI responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-8 bg-gradient-to-br from-muted/30 to-muted/50 min-h-[600px] flex items-center justify-center">
                  <ChatbotWidget
                    title={displaySettings.widget_title}
                    welcomeMessage={displaySettings.welcome_message}
                    primaryColor={displaySettings.primary_color}
                    position={displaySettings.position}
                    isPreview
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embed Code
                </CardTitle>
                <CardDescription>
                  Copy this code and paste it before the closing &lt;/body&gt; tag on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={copyEmbedCode}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="bg-accent/50 border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-2">
                    Installation Instructions
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Copy the embed code above</li>
                    <li>Paste it into your website's HTML, before the closing &lt;/body&gt; tag</li>
                    <li>The chatbot widget will automatically appear on your website</li>
                    <li>Messages will use your configured brand voice and settings</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
