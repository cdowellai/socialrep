import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAutomationRules, AutomationRule } from "@/hooks/useAutomationRules";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Zap,
  AlertTriangle,
  Archive,
  Bell,
  Tag,
  Send,
  Trash2,
  Settings2,
} from "lucide-react";

const triggerTypeLabels = {
  sentiment: "Sentiment Based",
  keyword: "Keyword Match",
  platform: "Platform Specific",
  time_based: "Time Based",
};

const actionTypeLabels = {
  auto_respond: "Auto Respond",
  escalate: "Escalate",
  archive: "Archive",
  notify: "Send Notification",
  tag: "Add Tag",
};

const actionTypeIcons = {
  auto_respond: Send,
  escalate: AlertTriangle,
  archive: Archive,
  notify: Bell,
  tag: Tag,
};

interface RuleFormData {
  name: string;
  description: string;
  trigger_type: "sentiment" | "keyword" | "platform" | "time_based";
  trigger_conditions: {
    sentiment_type?: "positive" | "neutral" | "negative";
    sentiment_threshold?: number;
    keywords?: string[];
    platforms?: string[];
  };
  action_type: "auto_respond" | "escalate" | "archive" | "notify" | "tag";
  action_config: {
    response_template?: string;
    notify_email?: string;
    tags?: string[];
  };
  priority: number;
}

const defaultFormData: RuleFormData = {
  name: "",
  description: "",
  trigger_type: "sentiment",
  trigger_conditions: {},
  action_type: "auto_respond",
  action_config: {},
  priority: 0,
};

export function AutomationRulesManager() {
  const { rules, loading, createRule, updateRule, deleteRule, toggleRule } =
    useAutomationRules();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RuleFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setKeywordInput("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (rule: AutomationRule) => {
    setFormData({
      name: rule.name,
      description: rule.description || "",
      trigger_type: rule.trigger_type,
      trigger_conditions: rule.trigger_conditions,
      action_type: rule.action_type,
      action_config: rule.action_config,
      priority: rule.priority,
    });
    setKeywordInput(rule.trigger_conditions.keywords?.join(", ") || "");
    setEditingId(rule.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Parse keywords from input
      const keywords = keywordInput
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const ruleData = {
        ...formData,
        trigger_conditions: {
          ...formData.trigger_conditions,
          keywords: formData.trigger_type === "keyword" ? keywords : undefined,
        },
      };

      if (editingId) {
        await updateRule(editingId, ruleData);
        toast({ title: "Rule updated", description: "Automation rule has been updated." });
      } else {
        await createRule({ ...ruleData, is_active: true });
        toast({ title: "Rule created", description: "New automation rule is now active." });
      }

      setDialogOpen(false);
      setFormData(defaultFormData);
      setEditingId(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save rule",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRule(id);
      toast({ title: "Rule deleted", description: "Automation rule has been removed." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await toggleRule(id, !currentState);
      toast({
        title: currentState ? "Rule disabled" : "Rule enabled",
        description: `Automation rule is now ${currentState ? "inactive" : "active"}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to toggle rule",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Automation Rules
            </CardTitle>
            <CardDescription>
              Automatically respond, escalate, or organize incoming interactions
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Rule" : "Create Automation Rule"}</DialogTitle>
                <DialogDescription>
                  Set up triggers and actions for automatic processing
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Auto-respond to positive feedback"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea
                    id="rule-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does this rule do?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          trigger_type: v as RuleFormData["trigger_type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sentiment">Sentiment Based</SelectItem>
                        <SelectItem value="keyword">Keyword Match</SelectItem>
                        <SelectItem value="platform">Platform Specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                      value={formData.action_type}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          action_type: v as RuleFormData["action_type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto_respond">Auto Respond</SelectItem>
                        <SelectItem value="escalate">Escalate</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                        <SelectItem value="notify">Notify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trigger Conditions */}
                {formData.trigger_type === "sentiment" && (
                  <div className="space-y-2">
                    <Label>Sentiment Type</Label>
                    <Select
                      value={formData.trigger_conditions.sentiment_type || ""}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          trigger_conditions: {
                            ...formData.trigger_conditions,
                            sentiment_type: v as "positive" | "neutral" | "negative",
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.trigger_type === "keyword" && (
                  <div className="space-y-2">
                    <Label>Keywords (comma separated)</Label>
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="help, urgent, complaint, refund"
                    />
                  </div>
                )}

                {/* Action Config */}
                {formData.action_type === "auto_respond" && (
                  <div className="space-y-2">
                    <Label>Response Template</Label>
                    <Textarea
                      value={formData.action_config.response_template || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action_config: {
                            ...formData.action_config,
                            response_template: e.target.value,
                          },
                        })
                      }
                      placeholder="Thank you for your feedback! We appreciate..."
                      rows={3}
                    />
                  </div>
                )}

                {formData.action_type === "notify" && (
                  <div className="space-y-2">
                    <Label>Notification Email</Label>
                    <Input
                      type="email"
                      value={formData.action_config.notify_email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action_config: {
                            ...formData.action_config,
                            notify_email: e.target.value,
                          },
                        })
                      }
                      placeholder="team@company.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Priority (higher = runs first)</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.name}>
                  {editingId ? "Update Rule" : "Create Rule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No automation rules yet</p>
            <p className="text-sm">Create rules to automate your workflow</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const ActionIcon = actionTypeIcons[rule.action_type];
              return (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    rule.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        rule.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <ActionIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {triggerTypeLabels[rule.trigger_type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description || actionTypeLabels[rule.action_type]}
                      </p>
                      {rule.execution_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Executed {rule.execution_count} times
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => handleToggle(rule.id, rule.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(rule)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
