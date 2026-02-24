import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ReviewPlatformConnections } from "./ReviewPlatformConnections";
import {
  Link2,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  Loader2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Plug,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  History,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Tables } from "@/integrations/supabase/types";

type ConnectedPlatform = Tables<"connected_platforms">;

interface DiagnosticCheck {
  name: string;
  status: "pass" | "fail" | "warn" | "info";
  detail: string;
  action?: "reconnect" | "reselect_page";
}

interface SyncLog {
  id: string;
  run_type: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  fetched_count: number;
  inserted_count: number;
  skipped_count: number;
  error_count: number;
  errors: any[];
}

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    description: "Pages & Groups management",
    icon: <Facebook className="h-5 w-5" />,
    color: "bg-[#1877F2]",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Business profile integration",
    icon: <Instagram className="h-5 w-5" />,
    color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    description: "Tweets, mentions & DMs",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Company page management",
    icon: <Linkedin className="h-5 w-5" />,
    color: "bg-[#0A66C2]",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Business account integration",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    color: "bg-black",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Channel comments management",
    icon: <Youtube className="h-5 w-5" />,
    color: "bg-[#FF0000]",
  },
];

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

function DiagnosticStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-4 w-4 text-sentiment-positive shrink-0" />;
    case "fail":
      return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
    case "warn":
      return <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

export function PlatformsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [refreshingPlatform, setRefreshingPlatform] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Diagnostics state
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticChecks, setDiagnosticChecks] = useState<DiagnosticCheck[] | null>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  // Sync logs state
  const [syncLogs, setSyncLogs] = useState<SyncLog[] | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Sync error details
  const [lastSyncDetails, setLastSyncDetails] = useState<any>(null);
  const [syncDetailsOpen, setSyncDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) fetchConnectedPlatforms();
  }, [user]);

  // Auto-sync polling
  const runAutoSync = useCallback(async () => {
    if (!user) return;
    const hasFacebook = connectedPlatforms.some((p) => p.platform === "facebook" && p.is_active);
    if (!hasFacebook) return;

    console.log(`[AutoSync] Running automatic sync at ${new Date().toISOString()}`);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth", {
        body: { action: "sync_interactions" },
      });
      if (error) {
        console.error("[AutoSync] Error:", error);
      } else {
        console.log("[AutoSync] Result:", data);
        if (data?.new_comments > 0 || data?.new_messages > 0) {
          setConnectedPlatforms((prev) =>
            prev.map((p) =>
              p.platform === "facebook" ? { ...p, last_synced_at: new Date().toISOString() } : p
            )
          );
        }
      }
    } catch (err) {
      console.error("[AutoSync] Failed:", err);
    }
  }, [user, connectedPlatforms]);

  useEffect(() => {
    const hasFacebook = connectedPlatforms.some((p) => p.platform === "facebook" && p.is_active);
    if (hasFacebook) {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = setInterval(runAutoSync, SYNC_INTERVAL_MS);
      console.log(`[AutoSync] Started polling every ${SYNC_INTERVAL_MS / 1000}s`);
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [connectedPlatforms, runAutoSync]);

  const fetchConnectedPlatforms = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("connected_platforms")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setConnectedPlatforms(data || []);
    } catch (err) {
      console.error("Error fetching platforms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: SocialPlatform) => {
    if (!user) return;
    if (platform.id === "facebook" || platform.id === "instagram") {
      setConnectingPlatform(platform.id);
      try {
        const { data: appData, error: appErr } = await supabase.functions.invoke("meta-oauth", {
          body: { action: "get_app_id" },
        });
        if (appErr || !appData?.app_id) throw new Error("Failed to get Meta App ID");
        const redirectUri = `${window.location.origin}/auth/meta/callback`;
        const scope = [
          "pages_show_list",
          "pages_read_engagement",
          "pages_read_user_content",
          "pages_manage_metadata",
          "pages_manage_posts",
          "pages_manage_engagement",
          "pages_messaging",
          "instagram_basic",
          "instagram_manage_comments",
          "instagram_manage_messages",
          "instagram_content_publish",
          "email",
          "public_profile",
          "business_management",
        ].join(",");
        const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(appData.app_id)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${encodeURIComponent(platform.id)}`;
        window.location.href = oauthUrl;
      } catch (err) {
        toast({ title: "Connection failed", description: "Failed to start Meta authorization.", variant: "destructive" });
        setConnectingPlatform(null);
      }
      return;
    }

    setConnectingPlatform(platform.id);
    try {
      const { data, error } = await supabase
        .from("connected_platforms")
        .insert({
          user_id: user.id,
          platform: platform.id as any,
          platform_account_name: `${platform.name} Account`,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      setConnectedPlatforms((prev) => [...prev, data]);
      toast({ title: "Platform connected", description: `${platform.name} has been connected successfully.` });
    } catch (err) {
      toast({ title: "Connection failed", description: "Failed to connect the platform.", variant: "destructive" });
    } finally {
      setConnectingPlatform(null);
    }
  };

  // FIX: Disconnect now also deletes all synced interactions from that platform
  const handleDisconnect = async (platformId: string, platformName: string, deleteData: boolean) => {
    if (!user) return;
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;
    
    setDisconnectingPlatform(platformId);
    try {
      // Delete the platform connection
      const { error: connError } = await supabase
        .from("connected_platforms")
        .delete()
        .eq("id", connection.id);
      if (connError) throw connError;

      // If user chose to delete data, remove all interactions from this platform
      if (deleteData) {
        const { error: interactionError } = await supabase
          .from("interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("platform", platformId as any);
        if (interactionError) {
          console.error("Failed to delete interactions:", interactionError);
        }
      }

      setConnectedPlatforms((prev) => prev.filter((p) => p.id !== connection.id));
      toast({
        title: "Platform disconnected",
        description: deleteData
          ? `${platformName} disconnected and all synced messages removed.`
          : `${platformName} has been disconnected. Existing messages kept.`,
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to disconnect the platform.", variant: "destructive" });
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  const handleTestConnection = async (platformId: string) => {
    if (platformId !== "facebook") return;
    setTestingPlatform(platformId);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth", {
        body: { action: "test_connection" },
      });
      if (error) throw error;
      if (data?.results?.length > 0) {
        const results = data.results.map((r: any) =>
          r.token_valid
            ? `✅ ${r.page}: Connection working — found ${r.posts_found} posts and ${r.comments_found} comments`
            : `❌ ${r.page}: ${r.error || "Token invalid"}`
        );
        setTestResult(results.join("\n"));
      } else {
        setTestResult("No connected pages found.");
      }
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message || "Failed to test connection"}`);
    } finally {
      setTestingPlatform(null);
    }
  };

  const handleRunDiagnostics = async () => {
    setRunningDiagnostics(true);
    setDiagnosticChecks(null);
    setDiagnosticsOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth", {
        body: { action: "run_diagnostics" },
      });
      if (error) throw error;
      setDiagnosticChecks(data?.checks || []);
    } catch (err: any) {
      setDiagnosticChecks([{ name: "Diagnostics", status: "fail", detail: err.message || "Failed to run diagnostics" }]);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const handleFetchLogs = async () => {
    setLoadingLogs(true);
    setLogsOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-oauth", {
        body: { action: "get_sync_logs" },
      });
      if (error) throw error;
      setSyncLogs(data?.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSyncNow = async (platformId: string) => {
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;
    setRefreshingPlatform(platformId);
    setLastSyncDetails(null);
    try {
      if (platformId === "facebook" || platformId === "instagram") {
        const { data, error } = await supabase.functions.invoke("meta-oauth", {
          body: { action: "sync_interactions" },
        });
        if (error) throw error;

        setConnectedPlatforms((prev) =>
          prev.map((p) =>
            p.id === connection.id ? { ...p, last_synced_at: new Date().toISOString() } : p
          )
        );

        setLastSyncDetails(data);
        if (data?.error_details?.length > 0) {
          setSyncDetailsOpen(true);
        }

        toast({
          title: "Sync complete",
          description: `Synced ${data?.new_comments || 0} comments, ${data?.new_messages || 0} messages.${data?.errors > 0 ? ` ${data.errors} error(s).` : ""}`,
          variant: data?.errors > 0 ? "destructive" : "default",
        });
      } else {
        const { error } = await supabase
          .from("connected_platforms")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", connection.id);
        if (error) throw error;
        setConnectedPlatforms((prev) =>
          prev.map((p) =>
            p.id === connection.id ? { ...p, last_synced_at: new Date().toISOString() } : p
          )
        );
        toast({ title: "Connection refreshed" });
      }
    } catch (err: any) {
      toast({ title: "Sync failed", description: err.message || "Check console for details.", variant: "destructive" });
    } finally {
      setRefreshingPlatform(null);
    }
  };

  const handleReconnect = () => {
    const fbPlatform = socialPlatforms.find((p) => p.id === "facebook");
    if (fbPlatform) handleConnect(fbPlatform);
  };

  const isConnected = (platformId: string) =>
    connectedPlatforms.some((p) => p.platform === platformId && p.is_active);

  const getConnection = (platformId: string) =>
    connectedPlatforms.find((p) => p.platform === platformId);

  const formatLastSynced = (date: string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const hasFacebookConnected = connectedPlatforms.some((p) => p.platform === "facebook" && p.is_active);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Social Media Platforms
          </CardTitle>
          <CardDescription>
            Connect your social media accounts to monitor and respond to interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialPlatforms.map((platform) => {
            const connected = isConnected(platform.id);
            const connection = getConnection(platform.id);

            return (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg ${platform.color} text-white flex items-center justify-center`}>
                    {platform.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{platform.name}</p>
                      {connected && (
                        <Badge className="bg-sentiment-positive/10 text-sentiment-positive text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    {connected && connection ? (
                      <div className="text-sm text-muted-foreground">
                        <p>{connection.platform_account_name}</p>
                        <p className="text-xs">Last synced: {formatLastSynced(connection.last_synced_at)}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      {platform.id === "facebook" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleTestConnection(platform.id)} disabled={testingPlatform === platform.id} title="Test connection">
                            <Plug className={`h-4 w-4 mr-1 ${testingPlatform === platform.id ? "animate-pulse" : ""}`} />
                            {testingPlatform === platform.id ? "Testing..." : "Test"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleRunDiagnostics} disabled={runningDiagnostics} title="Run diagnostics">
                            <Stethoscope className={`h-4 w-4 mr-1 ${runningDiagnostics ? "animate-pulse" : ""}`} />
                            {runningDiagnostics ? "Running..." : "Diagnostics"}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncNow(platform.id)}
                        disabled={refreshingPlatform === platform.id}
                        title="Sync data now"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${refreshingPlatform === platform.id ? "animate-spin" : ""}`} />
                        {refreshingPlatform === platform.id ? "Syncing..." : "Sync Now"}
                      </Button>
                      {/* FIX: Disconnect dialog now offers option to delete synced data */}
                      <DisconnectDialog
                        platformName={platform.name}
                        platformId={platform.id}
                        isDisconnecting={disconnectingPlatform === platform.id}
                        onDisconnect={(deleteData) => handleDisconnect(platform.id, platform.name, deleteData)}
                      />
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(platform)}
                      disabled={connectingPlatform === platform.id}
                    >
                      {connectingPlatform === platform.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Test Connection Result */}
          {testResult && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm font-medium mb-1">Connection Test Result</p>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{testResult}</pre>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setTestResult(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Last Sync Details */}
          {lastSyncDetails && (
            <Collapsible open={syncDetailsOpen} onOpenChange={setSyncDetailsOpen}>
              <div className="p-4 rounded-lg border bg-muted/50">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
                    <span className="text-sm font-medium">
                      Last Sync: {lastSyncDetails.new_comments} comments, {lastSyncDetails.new_messages} messages
                      {lastSyncDetails.errors > 0 && (
                        <span className="text-destructive ml-1">({lastSyncDetails.errors} errors)</span>
                      )}
                    </span>
                    {syncDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Found: {lastSyncDetails.total_comments_found} comments, {lastSyncDetails.total_messages_found} messages.
                    Skipped: {lastSyncDetails.skipped} duplicates.
                  </p>
                  {lastSyncDetails.error_details?.map((err: any, i: number) => (
                    <div key={i} className="text-xs p-2 rounded bg-destructive/10 text-destructive">
                      <strong>{err.endpoint}</strong>: [{err.code || "N/A"}] {err.message}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="mt-1" onClick={() => setLastSyncDetails(null)}>
                    Dismiss
                  </Button>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics Panel */}
      {hasFacebookConnected && (
        <Collapsible open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen}>
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Facebook Integration Diagnostics
                  </CardTitle>
                  {diagnosticsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {runningDiagnostics && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running diagnostics...
                  </div>
                )}

                {diagnosticChecks && diagnosticChecks.length > 0 && (
                  <div className="space-y-2">
                    {diagnosticChecks.map((check, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <DiagnosticStatusIcon status={check.status} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{check.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                          {check.action === "reconnect" && (
                            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={handleReconnect}>
                              Reconnect Facebook
                            </Button>
                          )}
                          {check.action === "reselect_page" && (
                            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={handleReconnect}>
                              Re-select Page
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!runningDiagnostics && !diagnosticChecks && (
                  <p className="text-sm text-muted-foreground">
                    Click "Run Diagnostics" above to check your Facebook integration health.
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Sync Run Logs */}
      {hasFacebookConnected && (
        <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-5 w-5 text-primary" />
                    Sync Run Logs
                  </CardTitle>
                  {logsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" onClick={handleFetchLogs} disabled={loadingLogs}>
                  {loadingLogs ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                  Load Logs
                </Button>

                {syncLogs && syncLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No sync logs found yet.</p>
                )}

                {syncLogs && syncLogs.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {syncLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card text-xs">
                        <Badge
                          variant={log.status === "success" ? "default" : log.status === "partial" ? "secondary" : "destructive"}
                          className="text-[10px] shrink-0"
                        >
                          {log.status}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{log.run_type}</p>
                          <p className="text-muted-foreground">
                            {new Date(log.started_at).toLocaleString()} · Fetched: {log.fetched_count} · Inserted: {log.inserted_count} · Skipped: {log.skipped_count} · Errors: {log.error_count}
                          </p>
                          {log.errors && (log.errors as any[]).length > 0 && (
                            <div className="mt-1 space-y-1">
                              {(log.errors as any[]).slice(0, 3).map((err: any, i: number) => (
                                <p key={i} className="text-destructive">[{err.endpoint || err.code}] {err.message}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <ReviewPlatformConnections />
    </div>
  );
}

// FIX: New disconnect dialog component with option to delete data
interface DisconnectDialogProps {
  platformName: string;
  platformId: string;
  isDisconnecting: boolean;
  onDisconnect: (deleteData: boolean) => void;
}

function DisconnectDialog({ platformName, platformId, isDisconnecting, onDisconnect }: DisconnectDialogProps) {
  const [deleteData, setDeleteData] = useState(true);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          title="Disconnect"
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {platformName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the connection and stop syncing data from {platformName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-1 py-2 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
            <input
              type="checkbox"
              id="delete-data"
              checked={deleteData}
              onChange={(e) => setDeleteData(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="delete-data" className="text-sm cursor-pointer">
              <span className="font-medium">Delete all synced messages</span>
              <p className="text-muted-foreground text-xs mt-0.5">
                Remove all comments and messages that were synced from {platformName}. This will clear your inbox and reset notification counts.
              </p>
            </label>
          </div>
          {!deleteData && (
            <p className="text-xs text-muted-foreground px-1">
              Existing messages will be kept in your inbox but no new messages will be synced.
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onDisconnect(deleteData)}
          >
            Disconnect{deleteData ? " & Delete Data" : ""}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
