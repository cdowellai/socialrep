import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAgentExecutionLogs, useAgentStats, useAgentAuditLogs } from "@/hooks/useAgentProviders";
import { Loader2, BarChart3, Activity, DollarSign, Clock, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const DECISION_COLORS: Record<string, string> = {
  sent: "bg-green-500/10 text-green-600",
  draft: "bg-blue-500/10 text-blue-600",
  escalated: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-600",
};

export function AgentLogsTab() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data: logsData, isLoading: logsLoading } = useAgentExecutionLogs(filters);
  const { data: stats, isLoading: statsLoading } = useAgentStats();
  const { data: auditLogs = [], isLoading: auditLoading } = useAgentAuditLogs();

  const logs = logsData?.data || [];

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ["Date", "Channel", "Provider", "Model", "Decision", "Latency (ms)", "Tokens In", "Tokens Out", "Cost", "Error"];
    const rows = logs.map((l: any) => [
      l.created_at, l.channel_type, l.agent_providers?.name || "", l.model_name || "",
      l.decision, l.latency_ms, l.token_in, l.token_out, l.estimated_cost, l.error_code || "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><BarChart3 className="h-4 w-4" />Total Requests</div>
              <p className="text-2xl font-bold mt-1">{stats.totalRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Activity className="h-4 w-4" />Success Rate</div>
              <p className="text-2xl font-bold mt-1">{stats.successRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Clock className="h-4 w-4" />Avg Latency</div>
              <p className="text-2xl font-bold mt-1">{stats.avgLatency}ms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" />Total Cost</div>
              <p className="text-2xl font-bold mt-1">${stats.totalCost}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="execution">
        <TabsList>
          <TabsTrigger value="execution">Execution Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="execution">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Execution Logs</CardTitle>
                <CardDescription>All AI inference calls with cost, latency, and decision outcomes.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filters.channel_type || ""} onValueChange={v => setFilters(f => ({ ...f, channel_type: v || undefined! }))}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Channel" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="review">Reviews</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="dm">DMs</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.decision || ""} onValueChange={v => setFilters(f => ({ ...f, decision: v || undefined! }))}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Decision" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No execution logs yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs">{format(new Date(l.created_at), "MMM d, HH:mm:ss")}</TableCell>
                        <TableCell><Badge variant="outline">{l.channel_type}</Badge></TableCell>
                        <TableCell className="text-sm">{l.agent_providers?.name || "—"}</TableCell>
                        <TableCell className="text-xs font-mono">{l.model_name || "—"}</TableCell>
                        <TableCell><Badge className={DECISION_COLORS[l.decision] || ""}>{l.decision}</Badge></TableCell>
                        <TableCell className="text-sm">{l.latency_ms ? `${l.latency_ms}ms` : "—"}</TableCell>
                        <TableCell className="text-xs">{l.token_in || 0}↑ {l.token_out || 0}↓</TableCell>
                        <TableCell className="text-sm">{l.estimated_cost ? `$${Number(l.estimated_cost).toFixed(4)}` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Immutable log of all configuration changes.</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : auditLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No audit events recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs">{format(new Date(a.created_at), "MMM d, HH:mm:ss")}</TableCell>
                        <TableCell><Badge variant="outline">{a.event_type}</Badge></TableCell>
                        <TableCell className="text-xs font-mono">{a.target_entity_type || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {a.metadata ? JSON.stringify(a.metadata) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
