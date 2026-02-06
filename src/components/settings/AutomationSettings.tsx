import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoResponseToggles } from "@/components/chatbot/AutoResponseToggles";
import { AutomationRulesManager } from "@/components/automation/AutomationRulesManager";
import { useAutomationRules } from "@/hooks/useAutomationRules";
import { useTeam } from "@/hooks/useTeam";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  UserPlus,
  Star,
  AlertTriangle,
  Tag,
  Save,
  Clock,
  Settings2,
} from "lucide-react";

interface AutoAssignRule {
  platform: string;
  assignTo: string;
}

export function AutomationSettings() {
  const { toast } = useToast();
  const { members } = useTeam();
  const { rules } = useAutomationRules();
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [autoRespondPositiveEnabled, setAutoRespondPositiveEnabled] = useState(false);
  const [autoEscalateEnabled, setAutoEscalateEnabled] = useState(false);
  const [autoTagEnabled, setAutoTagEnabled] = useState(true);
  const [escalationThreshold, setEscalationThreshold] = useState("2");
  const [autoAssignRules, setAutoAssignRules] = useState<AutoAssignRule[]>([
    { platform: "twitter", assignTo: "" },
  ]);

  const handleAddAssignRule = () => {
    setAutoAssignRules([...autoAssignRules, { platform: "", assignTo: "" }]);
  };

  const handleUpdateAssignRule = (index: number, field: "platform" | "assignTo", value: string) => {
    const updated = [...autoAssignRules];
    updated[index][field] = value;
    setAutoAssignRules(updated);
  };

  const handleRemoveAssignRule = (index: number) => {
    setAutoAssignRules(autoAssignRules.filter((_, i) => i !== index));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your automation settings have been updated.",
    });
  };

  const getTriggeredCount = (actionType: string) => {
    return rules
      .filter((r) => r.action_type === actionType)
      .reduce((sum, r) => sum + r.execution_count, 0);
  };

  return (
    <div className="space-y-6">
      {/* AI Auto-Response Toggles */}
      <AutoResponseToggles />

      {/* Quick Automation Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Automations
          </CardTitle>
          <CardDescription>
            Enable preset automation workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-Assign */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Auto-assign New Interactions</Label>
                    <Badge variant="outline" className="text-xs">
                      {getTriggeredCount("assign")} triggered
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign interactions based on platform
                  </p>
                </div>
              </div>
              <Switch
                checked={autoAssignEnabled}
                onCheckedChange={setAutoAssignEnabled}
              />
            </div>

            {autoAssignEnabled && (
              <div className="ml-13 pl-4 border-l-2 border-muted space-y-3">
                {autoAssignRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">If platform is</span>
                    <Select
                      value={rule.platform}
                      onValueChange={(v) => handleUpdateAssignRule(index, "platform", v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">assign to</span>
                    <Select
                      value={rule.assignTo}
                      onValueChange={(v) => handleUpdateAssignRule(index, "assignTo", v)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.full_name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {autoAssignRules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignRule(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddAssignRule}>
                  Add Rule
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Auto-Respond Positive Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sentiment-positive/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-sentiment-positive" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Auto-respond to Positive Reviews</Label>
                    <Badge variant="outline" className="text-xs">
                      {getTriggeredCount("auto_respond")} triggered
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically thank customers for 4-5 star reviews
                  </p>
                </div>
              </div>
              <Switch
                checked={autoRespondPositiveEnabled}
                onCheckedChange={setAutoRespondPositiveEnabled}
              />
            </div>

            {autoRespondPositiveEnabled && (
              <div className="ml-13 pl-4 border-l-2 border-muted">
                <p className="text-sm text-muted-foreground mb-2">
                  Using your brand voice settings to generate personalized thank you messages
                </p>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure Templates
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Auto-Escalate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sentiment-negative/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-sentiment-negative" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Auto-escalate Urgent Interactions</Label>
                    <Badge variant="outline" className="text-xs">
                      {getTriggeredCount("escalate")} triggered
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escalate interactions if no response within SLA
                  </p>
                </div>
              </div>
              <Switch
                checked={autoEscalateEnabled}
                onCheckedChange={setAutoEscalateEnabled}
              />
            </div>

            {autoEscalateEnabled && (
              <div className="ml-13 pl-4 border-l-2 border-muted flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Escalate if no response in</span>
                <Select value={escalationThreshold} onValueChange={setEscalationThreshold}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Auto-Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label className="text-base">Auto-tag Interactions</Label>
                  <Badge variant="outline" className="text-xs">AI Powered</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use AI sentiment analysis to automatically tag interactions
                </p>
              </div>
            </div>
            <Switch
              checked={autoTagEnabled}
              onCheckedChange={setAutoTagEnabled}
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Automation Settings
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Rules Manager */}
      <AutomationRulesManager />
    </div>
  );
}
