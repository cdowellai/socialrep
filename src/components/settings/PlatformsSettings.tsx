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
import type { Tables } from "@/integrations/supabase/types";

type ConnectedPlatform = Tables<"connected_platforms">;

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

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function PlatformsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [refreshingPlatform, setRefreshingPlatform] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnectedPlatforms();
    }
  }, [user]);

  // Auto-sync polling
  const runAutoSync = useCallback(async () => {
    if (!user) return;

    const hasFacebook = connectedPlatforms.some(
      (p) => p.platform === "facebook" && p.is_active
    );
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
          // Silently update last_synced_at in local state
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
    // Start auto-sync if we have connected Facebook pages
    const hasFacebook = connectedPlatforms.some(
      (p) => p.platform === "facebook" && p.is_active
    );

    if (hasFacebook) {
      // Clear existing interval
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
        if (appErr || !appData?.app_id) {
          throw new Error("Failed to get Meta App ID");
        }
        const redirectUri = `${window.location.origin}/auth/meta/callback`;
        const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,pages_read_user_content,email,public_profile,business_management";
        const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(appData.app_id)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${encodeURIComponent(platform.id)}`;
        window.location.href = oauthUrl;
      } catch (err) {
        console.error("Meta OAuth error:", err);
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
      console.error("Error connecting platform:", err);
      toast({ title: "Connection failed", description: "Failed to connect the platform. Please try again.", variant: "destructive" });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string, platformName: string) => {
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;

    try {
      const { error } = await supabase
        .from("connected_platforms")
        .delete()
        .eq("id", connection.id);

      if (error) throw error;
      setConnectedPlatforms((prev) => prev.filter((p) => p.id !== connection.id));
      toast({ title: "Platform disconnected", description: `${platformName} has been disconnected.` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to disconnect the platform.", variant: "destructive" });
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
        const results = data.results.map((r: any) => {
          if (r.token_valid) {
            return `✅ ${r.page}: Connection working — found ${r.posts_found} posts and ${r.comments_found} comments`;
          } else {
            return `❌ ${r.page}: ${r.error || "Token invalid"}`;
          }
        });
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

  const handleSyncNow = async (platformId: string) => {
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;

    setRefreshingPlatform(platformId);
    try {
      if (platformId === "facebook" || platformId === "instagram") {
        console.log(`[SyncNow] Triggering sync for ${platformId}...`);
        const { data, error } = await supabase.functions.invoke("meta-oauth", {
          body: { action: "sync_interactions" },
        });

        if (error) throw error;
        console.log(`[SyncNow] Sync result:`, data);

        setConnectedPlatforms((prev) =>
          prev.map((p) =>
            p.id === connection.id ? { ...p, last_synced_at: new Date().toISOString() } : p
          )
        );

        toast({
          title: "Sync complete",
          description: `Synced ${data?.new_comments || 0} new comments and ${data?.new_messages || 0} new messages.${data?.errors > 0 ? ` (${data.errors} errors)` : ""}`,
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

        toast({ title: "Connection refreshed", description: "Platform connection has been refreshed." });
      }
    } catch (err: any) {
      console.error("Sync error:", err);
      toast({
        title: "Sync failed",
        description: err.message || "Failed to sync data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setRefreshingPlatform(null);
    }
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(platform.id)}
                          disabled={testingPlatform === platform.id}
                          title="Test connection"
                        >
                          <Plug className={`h-4 w-4 mr-1 ${testingPlatform === platform.id ? "animate-pulse" : ""}`} />
                          {testingPlatform === platform.id ? "Testing..." : "Test"}
                        </Button>
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            title="Disconnect"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect {platform.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the connection and stop syncing data from {platform.name}. You can reconnect at any time.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDisconnect(platform.id, platform.name)}
                            >
                              Disconnect
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setTestResult(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewPlatformConnections />
    </div>
  );
}
