import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { KnowledgeBaseTab } from "@/components/chatbot/KnowledgeBaseTab";
import { ConversationsTab } from "@/components/chatbot/ConversationsTab";
import { ChatbotSettingsCard } from "@/components/chatbot/ChatbotSettingsCard";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Code, Settings, Eye, BookOpen, MessageSquare } from "lucide-react";
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
    human_handoff_enabled: false,
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
        human_handoff_enabled: settings.human_handoff_enabled,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const handleSettingsChange = (updates: Partial<typeof localSettings>) => {
    setLocalSettings((s) => ({ ...s, ...updates }));
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
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
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
              <ChatbotSettingsCard
                localSettings={localSettings}
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSave}
                saving={saving}
              />

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
                      collectName={localSettings.collect_name}
                      collectEmail={localSettings.collect_email}
                      isPreview
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBaseTab />
          </TabsContent>

          <TabsContent value="conversations">
            <ConversationsTab />
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
                    collectName={localSettings.collect_name}
                    collectEmail={localSettings.collect_email}
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
                    <li>Messages will use your configured brand voice and knowledge base</li>
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
