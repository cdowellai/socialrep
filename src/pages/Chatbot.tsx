import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { KnowledgeBaseTab } from "@/components/chatbot/KnowledgeBaseTab";
import { ConversationsTab } from "@/components/chatbot/ConversationsTab";
import { ChatbotSettingsCard } from "@/components/chatbot/ChatbotSettingsCard";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { FeaturePaywall } from "@/components/subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Code, Settings, Eye, BookOpen, MessageSquare, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
};

export default function ChatbotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, loading, saving, updateSettings } = useChatbotSettings();
  const { hasFeature, loading: subLoading } = useSubscription();
  const [copied, setCopied] = useState(false);
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

  const hasChatbotFeature = hasFeature("chatbot");

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

  const handleSave = () => updateSettings(localSettings);
  const handleSettingsChange = (updates: Partial<typeof localSettings>) => setLocalSettings((s) => ({ ...s, ...updates }));

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
    setCopied(true);
    toast({ title: "Copied!", description: "Embed code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || subLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[500px] rounded-2xl" />
            <Skeleton className="h-[500px] rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasChatbotFeature) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Chatbot</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Add an AI-powered chatbot to your website</p>
          </div>
          <FeaturePaywall
            feature="Website Chatbot"
            description="Add an AI-powered chatbot to your website that uses your brand voice to engage visitors 24/7."
            requiredPlan="Professional"
          />
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
      <div className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Chatbot</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Your always-on AI assistant for customers</p>
              </div>
            </div>
            <Badge variant={localSettings.is_enabled ? "default" : "secondary"} className="gap-1.5 px-3 py-1">
              <div className={`w-1.5 h-1.5 rounded-full ${localSettings.is_enabled ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
              {localSettings.is_enabled ? "Live" : "Offline"}
            </Badge>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 rounded-xl p-1">
              <TabsTrigger value="settings" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BookOpen className="h-4 w-4" /> Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="conversations" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4" /> Conversations
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Eye className="h-4 w-4" /> Preview
              </TabsTrigger>
              <TabsTrigger value="embed" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Code className="h-4 w-4" /> Install
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
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold tracking-tight">Live Preview</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">See how your chatbot appears to visitors</p>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-muted/20 p-4 min-h-[500px] flex items-center justify-center">
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="knowledge"><KnowledgeBaseTab /></TabsContent>
            <TabsContent value="conversations"><ConversationsTab /></TabsContent>

            <TabsContent value="preview">
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="mb-4">
                  <h3 className="text-base font-semibold tracking-tight">Full Preview</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Test your chatbot with real AI responses</p>
                </div>
                <div className="rounded-xl border border-border/30 bg-gradient-to-br from-muted/20 to-muted/40 min-h-[620px] flex items-center justify-center p-8">
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
              </div>
            </TabsContent>

            <TabsContent value="embed">
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">Install on Your Website</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Copy this code and paste it before the closing &lt;/body&gt; tag</p>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-muted/50 border border-border/50 p-5 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 gap-1.5 rounded-lg"
                    onClick={copyEmbedCode}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="mt-6 rounded-xl bg-accent/30 border border-accent/50 p-5">
                  <h4 className="font-semibold text-sm mb-3">Quick Setup Guide</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "Copy the embed code above",
                      "Paste it into your website's HTML, before the closing </body> tag",
                      "The chatbot widget will automatically appear on your website",
                      "Messages will use your configured brand voice and knowledge base",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
