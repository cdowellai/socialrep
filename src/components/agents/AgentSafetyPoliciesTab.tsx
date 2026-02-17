import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAgentSafetyPolicies, useCreateSafetyPolicy, useUpdateSafetyPolicy } from "@/hooks/useAgentProviders";
import { Plus, Loader2, Shield, AlertTriangle } from "lucide-react";

export function AgentSafetyPoliciesTab() {
  const { data: policies = [], isLoading } = useAgentSafetyPolicies();
  const createPolicy = useCreateSafetyPolicy();
  const updatePolicy = useUpdateSafetyPolicy();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    policy_name: "",
    blocked_topics: "",
    escalation_keywords: "",
    pii_redaction_enabled: false,
    allow_auto_send_low_risk: true,
    allow_auto_send_medium_risk: false,
    hard_escalate_high_risk: true,
    max_response_length: 500,
    confidence_threshold: 0.7,
  });

  const handleCreate = async () => {
    await createPolicy.mutateAsync({
      ...form,
      blocked_topics: form.blocked_topics.split(",").map(s => s.trim()).filter(Boolean),
      escalation_keywords: form.escalation_keywords.split(",").map(s => s.trim()).filter(Boolean),
    });
    setOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">Safety policies are critical</p>
              <p className="text-amber-700 dark:text-amber-300">These policies determine when AI can auto-send, require approval, or hard-escalate to a human. Configure carefully.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Safety Policies</CardTitle>
            <CardDescription>Define guardrails for AI response generation and auto-send behavior.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Policy</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Safety Policy</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Policy Name</Label>
                  <Input value={form.policy_name} onChange={e => setForm(f => ({ ...f, policy_name: e.target.value }))} placeholder="Default Safety Policy" />
                </div>
                <div className="space-y-2">
                  <Label>Blocked Topics (comma-separated)</Label>
                  <Textarea value={form.blocked_topics} onChange={e => setForm(f => ({ ...f, blocked_topics: e.target.value }))} placeholder="legal, refund, discrimination, medical advice" />
                </div>
                <div className="space-y-2">
                  <Label>Escalation Keywords (comma-separated)</Label>
                  <Textarea value={form.escalation_keywords} onChange={e => setForm(f => ({ ...f, escalation_keywords: e.target.value }))} placeholder="lawyer, sue, health department, BBB" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Response Length</Label>
                    <Input type="number" value={form.max_response_length} onChange={e => setForm(f => ({ ...f, max_response_length: parseInt(e.target.value) || 500 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confidence Threshold</Label>
                    <Input type="number" step="0.05" min="0" max="1" value={form.confidence_threshold} onChange={e => setForm(f => ({ ...f, confidence_threshold: parseFloat(e.target.value) || 0.7 }))} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>PII Redaction</Label>
                    <Switch checked={form.pii_redaction_enabled} onCheckedChange={v => setForm(f => ({ ...f, pii_redaction_enabled: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-send Low Risk</Label>
                    <Switch checked={form.allow_auto_send_low_risk} onCheckedChange={v => setForm(f => ({ ...f, allow_auto_send_low_risk: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-send Medium Risk</Label>
                    <Switch checked={form.allow_auto_send_medium_risk} onCheckedChange={v => setForm(f => ({ ...f, allow_auto_send_medium_risk: v }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Hard Escalate High Risk</Label>
                    <Switch checked={form.hard_escalate_high_risk} onCheckedChange={v => setForm(f => ({ ...f, hard_escalate_high_risk: v }))} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={!form.policy_name || createPolicy.isPending} className="w-full">
                  Create Policy
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No safety policies configured. Create one to enable guardrails.</p>
          ) : (
            <div className="space-y-4">
              {policies.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{p.policy_name}</h4>
                        {p.is_active ? <Badge className="bg-green-500/10 text-green-600">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <Switch checked={p.is_active} onCheckedChange={v => updatePolicy.mutate({ id: p.id, is_active: v })} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Auto-send Low:</span>{" "}
                        <span className={p.allow_auto_send_low_risk ? "text-green-600" : "text-red-600"}>
                          {p.allow_auto_send_low_risk ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auto-send Med:</span>{" "}
                        <span className={p.allow_auto_send_medium_risk ? "text-green-600" : "text-red-600"}>
                          {p.allow_auto_send_medium_risk ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Escalate High:</span>{" "}
                        <span className={p.hard_escalate_high_risk ? "text-green-600" : "text-amber-600"}>
                          {p.hard_escalate_high_risk ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">PII Redaction:</span>{" "}
                        {p.pii_redaction_enabled ? "On" : "Off"}
                      </div>
                    </div>
                    {p.blocked_topics?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.blocked_topics.map((t: string) => <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>)}
                      </div>
                    )}
                    {p.escalation_keywords?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.escalation_keywords.map((k: string) => <Badge key={k} variant="outline" className="text-xs border-amber-300">{k}</Badge>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
