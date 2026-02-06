import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { BrandVoiceTraining } from "@/components/brand/BrandVoiceTraining";
import { Brain, Save, Sparkles, Loader2, TestTube } from "lucide-react";

interface BrandSettings {
  brand_voice_description: string | null;
  response_tone: string | null;
  response_length: string | null;
  use_emojis: boolean;
  response_signature: string | null;
}

export function BrandAISettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [settings, setSettings] = useState<BrandSettings>({
    brand_voice_description: "",
    response_tone: "professional",
    response_length: "standard",
    use_emojis: false,
    response_signature: "",
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
        .select("brand_voice_description, response_tone, response_length, use_emojis, response_signature")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          brand_voice_description: data.brand_voice_description || "",
          response_tone: data.response_tone || "professional",
          response_length: data.response_length || "standard",
          use_emojis: data.use_emojis || false,
          response_signature: data.response_signature || "",
        });
      }
    } catch (err) {
      console.error("Error fetching brand settings:", err);
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
          brand_voice_description: settings.brand_voice_description,
          response_tone: settings.response_tone,
          response_length: settings.response_length,
          use_emojis: settings.use_emojis,
          response_signature: settings.response_signature,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Brand settings saved", description: "Your AI preferences have been updated." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save brand settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAI = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-response", {
        body: {
          content: "I am very disappointed with your product. It broke after just one week of use and customer service has been unhelpful.",
          platform: "google",
          interactionType: "review",
          sentiment: "negative",
          authorName: "John Smith",
        },
      });

      if (error) throw error;
      setTestResult(data.response || "No response generated");
    } catch (err) {
      toast({
        title: "Test failed",
        description: "Could not generate test response. Make sure your AI settings are configured.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
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
      {/* Brand Voice Training */}
      <BrandVoiceTraining />

      {/* Brand Voice Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Brand Voice Description
          </CardTitle>
          <CardDescription>
            Describe your brand's tone, style, and communication guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={settings.brand_voice_description || ""}
            onChange={(e) => setSettings({ ...settings, brand_voice_description: e.target.value })}
            placeholder="E.g., Professional but friendly, never use slang, always address customers by first name, show empathy first before offering solutions..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            This description helps the AI understand how to craft responses that match your brand's personality.
          </p>
        </CardContent>
      </Card>

      {/* Response Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Response Preferences</CardTitle>
          <CardDescription>
            Configure how AI generates responses for your brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Response Tone</Label>
              <Select
                value={settings.response_tone || "professional"}
                onValueChange={(v) => setSettings({ ...settings, response_tone: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Response Length</Label>
              <Select
                value={settings.response_length || "standard"}
                onValueChange={(v) => setSettings({ ...settings, response_length: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise (1-2 sentences)</SelectItem>
                  <SelectItem value="standard">Standard (2-4 sentences)</SelectItem>
                  <SelectItem value="detailed">Detailed (4+ sentences)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Response Signature</Label>
            <Input
              value={settings.response_signature || ""}
              onChange={(e) => setSettings({ ...settings, response_signature: e.target.value })}
              placeholder="- The [Your Brand] Team"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Emojis</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to include relevant emojis in responses
              </p>
            </div>
            <Switch
              checked={settings.use_emojis}
              onCheckedChange={(checked) => setSettings({ ...settings, use_emojis: checked })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Brand Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Test AI Response */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Test AI Response
          </CardTitle>
          <CardDescription>
            Generate a sample response to a negative review using your brand voice settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium mb-2">Sample Negative Review:</p>
            <p className="text-sm text-muted-foreground italic">
              "I am very disappointed with your product. It broke after just one week of use and customer service has been unhelpful."
            </p>
            <p className="text-xs text-muted-foreground mt-2">— John Smith, Google Reviews</p>
          </div>

          <Button onClick={handleTestAI} disabled={testing} variant="outline" className="w-full">
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Response...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Test Response
              </>
            )}
          </Button>

          {testResult && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Generated Response:
              </p>
              <p className="text-sm whitespace-pre-wrap">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
