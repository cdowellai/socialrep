import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAgentRoutingRules, useCreateRoutingRule, useUpdateRoutingRule, useDeleteRoutingRule, useAgentProviders } from "@/hooks/useAgentProviders";
import { Plus, Trash2, Loader2, ArrowUpDown } from "lucide-react";

const CHANNELS = [
  { value: "review", label: "Reviews" },
  { value: "comment", label: "Comments" },
  { value: "dm", label: "DMs" },
];

const SENTIMENTS = [
  { value: "", label: "Any" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
  { value: "mixed", label: "Mixed" },
];

const RISK_LEVELS = [
  { value: "", label: "Any" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const ACTION_MODES = [
  { value: "auto_send", label: "Auto-Send" },
  { value: "draft_only", label: "Draft Only" },
  { value: "requires_approval", label: "Requires Approval" },
];

export function AgentRoutingRulesTab() {
  const { data: rules = [], isLoading } = useAgentRoutingRules();
  const { data: providers = [] } = useAgentProviders();
  const createRule = useCreateRoutingRule();
  const updateRule = useUpdateRoutingRule();
  const deleteRule = useDeleteRoutingRule();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    channel_type: "review",
    sentiment_class: "",
    risk_level: "",
    provider_id: "",
    model_name: "",
    action_mode: "requires_approval",
    priority: 0,
  });

  const handleCreate = async () => {
    await createRule.mutateAsync({
      ...form,
      sentiment_class: form.sentiment_class || null,
      risk_level: form.risk_level || null,
      provider_id: form.provider_id || null,
    });
    setOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Routing Rules</CardTitle>
            <CardDescription>Define how interactions are routed to AI providers. Rules are evaluated by priority (lowest first).</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Rule</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Routing Rule</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Auto-send positive reviews" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select value={form.channel_type} onValueChange={v => setForm(f => ({ ...f, channel_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sentiment</Label>
                    <Select value={form.sentiment_class} onValueChange={v => setForm(f => ({ ...f, sentiment_class: v }))}>
                      <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>{SENTIMENTS.map(s => <SelectItem key={s.value || "any"} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select value={form.risk_level} onValueChange={v => setForm(f => ({ ...f, risk_level: v }))}>
                      <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>{RISK_LEVELS.map(r => <SelectItem key={r.value || "any"} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select value={form.action_mode} onValueChange={v => setForm(f => ({ ...f, action_mode: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ACTION_MODES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={form.provider_id} onValueChange={v => setForm(f => ({ ...f, provider_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                      <SelectContent>
                        {(providers as any[]).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={!form.name || createRule.isPending} className="w-full">
                  {createRule.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No routing rules defined. Add rules to control AI response behavior.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><ArrowUpDown className="h-3 w-3 inline mr-1" />Priority</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.priority}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell><Badge variant="outline">{r.channel_type}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.sentiment_class && <Badge variant="secondary" className="mr-1">{r.sentiment_class}</Badge>}
                      {r.risk_level && <Badge variant="secondary">{r.risk_level} risk</Badge>}
                      {!r.sentiment_class && !r.risk_level && "Any"}
                    </TableCell>
                    <TableCell>{r.agent_providers?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.action_mode === "auto_send" ? "default" : r.action_mode === "requires_approval" ? "secondary" : "outline"}>
                        {ACTION_MODES.find(a => a.value === r.action_mode)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={r.is_active} onCheckedChange={v => updateRule.mutate({ id: r.id, is_active: v })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => deleteRule.mutate(r.id)}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
