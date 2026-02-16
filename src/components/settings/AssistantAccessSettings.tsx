import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTeam } from "@/hooks/useTeam";
import {
  ShieldCheck,
  Plus,
  Copy,
  RefreshCw,
  Ban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  History,
} from "lucide-react";
import { format } from "date-fns";

interface AccessRecord {
  id: string;
  email: string;
  role: string;
  team_id: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  status: string;
  last_login_at: string | null;
  auth_user_id: string | null;
}

interface AuditLog {
  id: string;
  access_id: string | null;
  event_type: string;
  actor_id: string | null;
  target_email: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function AssistantAccessSettings() {
  const { toast } = useToast();
  const { team, isAdmin } = useTeam();
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [lastPassword, setLastPassword] = useState<string | null>(null);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("viewer");
  const [formExpiration, setFormExpiration] = useState("24h");
  const [formCustomExpiry, setFormCustomExpiry] = useState("");
  const [formUsePassword, setFormUsePassword] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("assistant-access", {
        method: "GET",
      });
      if (error) throw error;
      setRecords(data?.records || []);
    } catch (err) {
      console.error("Failed to fetch access records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    if (!team) return;
    const { data } = await supabase
      .from("assistant_access_audit_logs")
      .select("*")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setAuditLogs((data as AuditLog[]) || []);
  }, [team]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleCreate = async () => {
    if (!formEmail) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    setCreating(true);
    setLastLink(null);
    setLastPassword(null);
    try {
      const { data, error } = await supabase.functions.invoke("assistant-access", {
        method: "POST",
        body: {
          email: formEmail,
          role: formRole,
          expiration: formExpiration,
          custom_expiration: formExpiration === "custom" ? formCustomExpiry : undefined,
          use_password: formUsePassword,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Access created", description: `Temporary access granted to ${formEmail}` });
      if (data?.login_link) setLastLink(data.login_link);
      if (data?.temp_password) setLastPassword(data.temp_password);

      setFormEmail("");
      setFormRole("viewer");
      setFormExpiration("24h");
      setFormUsePassword(false);
      if (!data?.login_link) setShowCreate(false);
      fetchRecords();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create access", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setActionLoading(id);
    try {
      const { data, error } = await supabase.functions.invoke(`assistant-access/${id}/revoke`, {
        method: "POST",
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Access revoked" });
      fetchRecords();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (id: string) => {
    setActionLoading(id);
    try {
      const { data, error } = await supabase.functions.invoke(`assistant-access/${id}/resend`, {
        method: "POST",
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.login_link) {
        await navigator.clipboard.writeText(data.login_link);
        toast({ title: "Link copied", description: "New magic link copied to clipboard" });
      } else {
        toast({ title: "Link regenerated" });
      }
      fetchRecords();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtend = async (id: string) => {
    setActionLoading(id);
    try {
      const { data, error } = await supabase.functions.invoke(`assistant-access/${id}/extend`, {
        method: "POST",
        body: { expiration: "24h" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Access extended by 24h" });
      fetchRecords();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "revoked":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Only workspace owners and admins can manage assistant access.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">Security Notice</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>• Temporary access is intended for support/testing only.</li>
              <li>• <strong>Never share owner credentials.</strong></li>
              <li>• All access actions are logged.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Access Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                AI Assistant Access
              </CardTitle>
              <CardDescription>Create and manage temporary login access for external assistants</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowAuditLog(true); fetchAuditLogs(); }}
              >
                <History className="h-4 w-4 mr-1" />
                Audit Log
              </Button>
              <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) { setLastLink(null); setLastPassword(null); } }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Temporary Access
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Temporary Access</DialogTitle>
                    <DialogDescription>Grant scoped, time-limited access to an external user.</DialogDescription>
                  </DialogHeader>

                  {lastLink ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                        <p className="text-sm font-medium text-green-600">✅ Access created successfully!</p>
                        <div className="space-y-2">
                          <Label>Magic Login Link</Label>
                          <div className="flex gap-2">
                            <Input value={lastLink} readOnly className="text-xs" />
                            <Button size="icon" variant="outline" onClick={() => copyToClipboard(lastLink)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">This link expires in 30 minutes.</p>
                        </div>
                        {lastPassword && (
                          <div className="space-y-2">
                            <Label>Temporary Password</Label>
                            <div className="flex gap-2">
                              <Input value={lastPassword} readOnly className="text-xs font-mono" />
                              <Button size="icon" variant="outline" onClick={() => copyToClipboard(lastPassword)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button onClick={() => { setShowCreate(false); setLastLink(null); setLastPassword(null); }}>Done</Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="access-email">Email</Label>
                        <Input
                          id="access-email"
                          type="email"
                          placeholder="assistant@example.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={formRole} onValueChange={setFormRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer — Read-only access</SelectItem>
                            <SelectItem value="operator">Operator — Can respond &amp; manage</SelectItem>
                            <SelectItem value="admin">Admin — Full access (except billing)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expiration</Label>
                        <Select value={formExpiration} onValueChange={setFormExpiration}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24h">24 hours</SelectItem>
                            <SelectItem value="72h">72 hours</SelectItem>
                            <SelectItem value="7d">7 days</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {formExpiration === "custom" && (
                          <Input
                            type="datetime-local"
                            value={formCustomExpiry}
                            onChange={(e) => setFormCustomExpiry(e.target.value)}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Password mode</Label>
                          <p className="text-xs text-muted-foreground">Generate temp password instead of magic link only</p>
                        </div>
                        <Switch checked={formUsePassword} onCheckedChange={setFormUsePassword} />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating}>
                          {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          Create Access
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No temporary access records yet.</p>
              <p className="text-sm">Create one to grant scoped access to an external assistant.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{r.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(r.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(r.expires_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.last_login_at ? format(new Date(r.last_login_at), "MMM d, HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== "revoked" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Resend Link"
                                onClick={() => handleResend(r.id)}
                                disabled={actionLoading === r.id}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Extend 24h"
                                onClick={() => handleExtend(r.id)}
                                disabled={actionLoading === r.id}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Revoke"
                                    className="text-destructive hover:text-destructive"
                                    disabled={actionLoading === r.id}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Revoke access for {r.email}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will immediately block access. The user will be removed from the workspace.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleRevoke(r.id)}
                                    >
                                      Revoke Access
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Access Audit Log</DialogTitle>
            <DialogDescription>All assistant access actions are logged here.</DialogDescription>
          </DialogHeader>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No audit events yet.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border text-sm">
                  <div className="shrink-0 mt-0.5">
                    {log.event_type === "access_created" && <Plus className="h-4 w-4 text-green-500" />}
                    {log.event_type === "access_revoked" && <Ban className="h-4 w-4 text-destructive" />}
                    {log.event_type === "access_used" && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                    {log.event_type === "access_expired" && <Clock className="h-4 w-4 text-muted-foreground" />}
                    {log.event_type === "access_extended" && <RefreshCw className="h-4 w-4 text-amber-500" />}
                    {log.event_type === "link_resent" && <Send className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p>
                      <span className="font-medium capitalize">{log.event_type.replace(/_/g, " ")}</span>
                      {log.target_email && <span className="text-muted-foreground"> — {log.target_email}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      {log.ip_address && log.ip_address !== "unknown" && ` • IP: ${log.ip_address}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
