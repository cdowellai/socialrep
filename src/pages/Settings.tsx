import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  TeamManagement,
  BrandAISettings,
  AutomationSettings,
  PlatformsSettings,
  NotificationsSettings,
  BillingSettings,
  AssistantAccessSettings,
} from "@/components/settings";
import { FeaturePaywall } from "@/components/subscription";
import { AgentSettingsPage } from "@/components/agents";
import {
  User,
  CreditCard,
  Bell,
  Link2,
  Zap,
  Brain,
  Users,
  Save,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasFeature } = useSubscription();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    company_name: "",
  });

  // Check features
  const hasBrandAI = hasFeature("brand_ai");
  const hasAutomations = hasFeature("automations");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        company_name: data.company_name || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Profile saved", description: "Your changes have been saved successfully." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-9 w-full">
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
            <TabsTrigger value="agents">
              <Cpu className="h-4 w-4 mr-2" />
              AI Agents
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
            <TabsTrigger value="assistant">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Assistant
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
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="Your Company"
                    value={profile.company_name}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
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
            {hasBrandAI ? (
              <BrandAISettings />
            ) : (
              <FeaturePaywall
                feature="Brand AI Training"
                description="Train AI to match your brand's unique voice and tone across all responses."
                requiredPlan="Professional"
              />
            )}
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <AgentSettingsPage />
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            {hasAutomations ? (
              <AutomationSettings />
            ) : (
              <FeaturePaywall
                feature="Automation Rules"
                description="Set up automated responses, escalations, and workflows to save time."
                requiredPlan="Professional"
              />
            )}
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <PlatformsSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSettings />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingSettings />
          </TabsContent>

          {/* Assistant Access Tab */}
          <TabsContent value="assistant" className="space-y-6">
            <AssistantAccessSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
