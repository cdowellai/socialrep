import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AutomationRulesManager } from "@/components/automation/AutomationRulesManager";
import { AutoResponseToggles } from "@/components/chatbot/AutoResponseToggles";
import { BrandVoiceTraining } from "@/components/brand/BrandVoiceTraining";
import { TeamManagement } from "@/components/settings/TeamManagement";
import { ReviewPlatformConnections } from "@/components/settings/ReviewPlatformConnections";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Link2,
  Sparkles,
  Save,
  Check,
  Plus,
  Zap,
  Brain,
  Users,
} from "lucide-react";

const connectedPlatforms = [
  { id: "instagram", name: "Instagram", connected: true, account: "@yourbrand" },
  { id: "facebook", name: "Facebook", connected: true, account: "Your Brand Page" },
  { id: "twitter", name: "Twitter/X", connected: false, account: null },
  { id: "linkedin", name: "LinkedIn", connected: true, account: "Your Company" },
  { id: "google", name: "Google Business", connected: true, account: "Your Business" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast({ title: "Settings saved", description: "Your changes have been saved successfully." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="brand">
              <Brain className="h-4 w-4 mr-2" />
              Brand AI
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Zap className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="platforms">
              <Link2 className="h-4 w-4 mr-2" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your Company" />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <TeamManagement />
          </TabsContent>

          {/* Brand AI Tab */}
          <TabsContent value="brand" className="space-y-6">
            <BrandVoiceTraining />

            <Card>
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
                <CardDescription>
                  Configure basic AI response preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tone">Default Communication Tone</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="playful">Playful & Fun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Response Signature</Label>
                  <Input id="signature" placeholder="- The [Your Brand] Team" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Use Emojis</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to include relevant emojis in responses
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-language Support</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect and respond in the customer's language
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Brand Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <AutoResponseToggles />
            <AutomationRulesManager />

            <Card>
              <CardHeader>
                <CardTitle>Global Automation Settings</CardTitle>
                <CardDescription>
                  Configure default behaviors for automated actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Auto-Responses</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow automation rules to send responses automatically
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Review auto-responses before they are sent
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Escalate Negative Sentiment</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically flag interactions with strong negative sentiment
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Escalation Threshold</Label>
                  <Select defaultValue="0.3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.2">Very Sensitive (0.2)</SelectItem>
                      <SelectItem value="0.3">Standard (0.3)</SelectItem>
                      <SelectItem value="0.4">Moderate (0.4)</SelectItem>
                      <SelectItem value="0.5">Relaxed (0.5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <ReviewPlatformConnections />

            <Card>
              <CardHeader>
                <CardTitle>Social Media Platforms</CardTitle>
                <CardDescription>
                  Manage your social media integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-accent/50 border border-primary/20 mb-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Running in Sandbox Mode - No live API connections
                  </p>
                </div>
                {connectedPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-semibold">
                        {platform.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        {platform.connected ? (
                          <p className="text-sm text-muted-foreground">{platform.account}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not connected</p>
                        )}
                      </div>
                    </div>
                    {platform.connected ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-sentiment-positive/10 text-sentiment-positive">
                          <Check className="h-3 w-3 mr-1" />
                          Simulated
                        </Badge>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button variant="hero" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: "New Interactions",
                    description: "Get notified when you receive new comments or messages",
                  },
                  {
                    title: "Negative Sentiment Alerts",
                    description: "Immediate alerts for negative reviews or comments",
                  },
                  {
                    title: "Automation Triggers",
                    description: "Notify when automation rules are executed",
                  },
                  {
                    title: "Weekly Reports",
                    description: "Receive weekly performance summary via email",
                  },
                  {
                    title: "Lead Notifications",
                    description: "Alert when a new lead is detected",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{item.title}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg border border-primary/20 bg-accent/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Free Plan</h3>
                      <p className="text-sm text-muted-foreground">100 interactions/month</p>
                    </div>
                    <Badge>Current Plan</Badge>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage this month</span>
                      <span>45/100 interactions</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                    </div>
                  </div>
                  <Button variant="hero" className="w-full">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Usage</CardTitle>
                <CardDescription>Track your AI response generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">AI Responses</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Auto-Actions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
