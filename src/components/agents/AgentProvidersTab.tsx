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
import { useAgentProviders, useCreateProvider, useUpdateProvider, useDeleteProvider, useTestProvider } from "@/hooks/useAgentProviders";
import { Plus, TestTube, Trash2, Pencil, Loader2, Wifi, WifiOff } from "lucide-react";

const PROVIDER_TYPES = [
  { value: "openclaw", label: "OpenClaw" },
  { value: "openai", label: "OpenAI" },
  { value: "openai_compatible", label: "OpenAI-Compatible" },
];

const DEFAULT_URLS: Record<string, string> = {
  openclaw: "https://api.openclaw.com/v1",
  openai: "https://api.openai.com/v1",
  openai_compatible: "",
};

export function AgentProvidersTab() {
  const { data: providers = [], isLoading } = useAgentProviders();
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const deleteProvider = useDeleteProvider();
  const testProvider = useTestProvider();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    provider_type: "openai_compatible" as string,
    base_url: "",
    api_key: "",
    org_id: "",
    default_model: "",
    timeout_ms: 30000,
    max_retries: 3,
    rate_limit_per_minute: 60,
  });

  const resetForm = () => {
    setForm({
      name: "", provider_type: "openai_compatible", base_url: "", api_key: "",
      org_id: "", default_model: "", timeout_ms: 30000, max_retries: 3, rate_limit_per_minute: 60,
    });
  };

  const handleCreate = async () => {
    await createProvider.mutateAsync({
      ...form,
      base_url: form.base_url || DEFAULT_URLS[form.provider_type] || undefined,
    });
    resetForm();
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
            <CardTitle>AI Providers</CardTitle>
            <CardDescription>Connect external AI providers for response generation.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Provider</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add AI Provider</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input placeholder="My OpenAI Provider" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Provider Type</Label>
                  <Select value={form.provider_type} onValueChange={v => setForm(f => ({ ...f, provider_type: v, base_url: DEFAULT_URLS[v] || "" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Base URL</Label>
                  <Input placeholder="https://api.example.com/v1" value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="sk-..." value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Encrypted at rest. Never shown again after save.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization ID (optional)</Label>
                    <Input value={form.org_id} onChange={e => setForm(f => ({ ...f, org_id: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Model</Label>
                    <Input placeholder="gpt-4o" value={form.default_model} onChange={e => setForm(f => ({ ...f, default_model: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Timeout (ms)</Label>
                    <Input type="number" value={form.timeout_ms} onChange={e => setForm(f => ({ ...f, timeout_ms: parseInt(e.target.value) || 30000 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Retries</Label>
                    <Input type="number" value={form.max_retries} onChange={e => setForm(f => ({ ...f, max_retries: parseInt(e.target.value) || 3 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Limit/min</Label>
                    <Input type="number" value={form.rate_limit_per_minute} onChange={e => setForm(f => ({ ...f, rate_limit_per_minute: parseInt(e.target.value) || 60 }))} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={!form.name || !form.api_key || createProvider.isPending} className="w-full">
                  {createProvider.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Provider
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No providers configured yet. Add your first AI provider to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{PROVIDER_TYPES.find(t => t.value === p.provider_type)?.label || p.provider_type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.default_model || "—"}</TableCell>
                    <TableCell>
                      {p.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200"><Wifi className="h-3 w-3 mr-1" />Active</Badge>
                      ) : (
                        <Badge variant="secondary"><WifiOff className="h-3 w-3 mr-1" />Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.has_api_key ? <span className="text-xs font-mono text-muted-foreground">••••••••</span> : <span className="text-destructive text-xs">Not set</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => testProvider.mutate(p.id)} disabled={testProvider.isPending}>
                        {testProvider.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <TestTube className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateProvider.mutate({ id: p.id, is_active: !p.is_active })}>
                        {p.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProvider.mutate(p.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
