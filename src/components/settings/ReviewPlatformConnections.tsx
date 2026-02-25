import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Star,
  Check,
  Plus,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
  Building2,
  Briefcase,
  ShoppingBag,
  Smartphone,
  MessageSquare,
  Info,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type ConnectedPlatform = Tables<"connected_platforms">;

interface ReviewPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: "business" | "software" | "consumer" | "app";
  setupUrl: string;
  connectMethod: "google_oauth" | "trustpilot_api" | "manual";
  helpText?: string;
}

const reviewPlatforms: ReviewPlatform[] = [
  {
    id: "google",
    name: "Google Business",
    description: "Google Maps and Search reviews",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    color: "bg-white border",
    category: "business",
    setupUrl: "https://business.google.com/",
    connectMethod: "google_oauth",
    helpText: "Connect via Google OAuth to automatically sync your Google Business reviews.",
  },
  {
    id: "trustpilot",
    name: "Trustpilot",
    description: "Consumer reviews and ratings platform",
    icon: <Star className="h-5 w-5" />,
    color: "bg-emerald-500",
    category: "business",
    setupUrl: "https://business.trustpilot.com/",
    connectMethod: "trustpilot_api",
    helpText: "Enter your Trustpilot Business Unit ID to sync reviews. Find it in your Trustpilot Business account.",
  },
  {
    id: "yelp",
    name: "Yelp",
    description: "Local business reviews",
    icon: <Star className="h-5 w-5" />,
    color: "bg-red-500",
    category: "business",
    setupUrl: "https://biz.yelp.com/",
    connectMethod: "manual",
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    description: "Travel and hospitality reviews",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "bg-green-600",
    category: "business",
    setupUrl: "https://www.tripadvisor.com/Owners",
    connectMethod: "manual",
  },
  {
    id: "g2",
    name: "G2",
    description: "B2B software reviews",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-orange-500",
    category: "software",
    setupUrl: "https://sell.g2.com/",
    connectMethod: "manual",
  },
  {
    id: "capterra",
    name: "Capterra",
    description: "Software comparison and reviews",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-blue-600",
    category: "software",
    setupUrl: "https://www.capterra.com/vendors/",
    connectMethod: "manual",
  },
  {
    id: "bbb",
    name: "Better Business Bureau",
    description: "Business accreditation and reviews",
    icon: <Building2 className="h-5 w-5" />,
    color: "bg-blue-800",
    category: "business",
    setupUrl: "https://www.bbb.org/get-accredited",
    connectMethod: "manual",
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    description: "Employee and company reviews",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-green-500",
    category: "business",
    setupUrl: "https://www.glassdoor.com/employers/",
    connectMethod: "manual",
  },
  {
    id: "amazon",
    name: "Amazon Reviews",
    description: "Product reviews on Amazon",
    icon: <ShoppingBag className="h-5 w-5" />,
    color: "bg-yellow-500",
    category: "consumer",
    setupUrl: "https://sellercentral.amazon.com/",
    connectMethod: "manual",
  },
  {
    id: "appstore",
    name: "Apple App Store",
    description: "iOS app reviews and ratings",
    icon: <Smartphone className="h-5 w-5" />,
    color: "bg-gray-800",
    category: "app",
    setupUrl: "https://appstoreconnect.apple.com/",
    connectMethod: "manual",
  },
  {
    id: "playstore",
    name: "Google Play Store",
    description: "Android app reviews and ratings",
    icon: <Smartphone className="h-5 w-5" />,
    color: "bg-green-600",
    category: "app",
    setupUrl: "https://play.google.com/console/",
    connectMethod: "manual",
  },
];

const categoryLabels: Record<string, string> = {
  business: "Business & Local",
  software: "Software & B2B",
  consumer: "Consumer & E-commerce",
  app: "Mobile Apps",
};

export function ReviewPlatformConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);

  // Dialog state
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<ReviewPlatform | null>(null);

  // Trustpilot-specific fields
  const [tpBusinessUnitId, setTpBusinessUnitId] = useState("");
  const [tpBusinessName, setTpBusinessName] = useState("");
  const [tpApiKey, setTpApiKey] = useState("");

  // Manual connect fields
  const [accountName, setAccountName] = useState("");
  const [accountId, setAccountId] = useState("");

  const fetchConnectedPlatforms = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchConnectedPlatforms();
  }, [fetchConnectedPlatforms]);

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleCode = params.get("google_code");
    const googleState = params.get("state");

    if (googleCode && googleState === "google_business") {
      // Remove params from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("google_code");
      url.searchParams.delete("state");
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());

      handleGoogleCallback(googleCode);
    }
  }, []);

  const handleGoogleCallback = async (code: string) => {
    setConnectingPlatform("google");
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const { data, error } = await supabase.functions.invoke("google-oauth", {
        body: { action: "exchange_code", code, redirect_uri: redirectUri },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to exchange Google code");
      }

      if (data.locations && data.locations.length > 0) {
        // Connect all locations automatically
        const { data: connData, error: connErr } = await supabase.functions.invoke("google-oauth", {
          body: {
            action: "connect_locations",
            locations: data.locations,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          },
        });

        if (connErr || !connData?.success) {
          throw new Error(connData?.error || connErr?.message || "Failed to connect locations");
        }

        toast({
          title: "Google Business connected",
          description: `Connected ${data.locations.length} location(s). Syncing reviews...`,
        });

        await fetchConnectedPlatforms();

        // Auto-sync reviews
        await handleSync("google");
      } else {
        toast({
          title: "No locations found",
          description: "No Google Business locations found on your account.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Google callback error:", err);
      toast({
        title: "Google connection failed",
        description: err.message || "Failed to connect Google Business.",
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleConnect = (platform: ReviewPlatform) => {
    setSelectedPlatform(platform);
    setAccountName("");
    setAccountId("");
    setTpBusinessUnitId("");
    setTpBusinessName("");
    setTpApiKey("");

    if (platform.connectMethod === "google_oauth") {
      initiateGoogleOAuth();
      return;
    }

    setShowConnectDialog(true);
  };

  const initiateGoogleOAuth = async () => {
    setConnectingPlatform("google");
    try {
      const { data, error } = await supabase.functions.invoke("google-oauth", {
        body: { action: "get_client_id" },
      });

      if (error || !data?.client_id) {
        // Google OAuth not configured — show manual setup dialog
        toast({
          title: "Google OAuth not configured",
          description: "GOOGLE_CLIENT_ID is not set in Supabase secrets. Contact your administrator.",
          variant: "destructive",
        });
        setConnectingPlatform(null);
        return;
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = [
        "https://www.googleapis.com/auth/business.manage",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" ");

      const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      oauthUrl.searchParams.set("client_id", data.client_id);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("response_type", "code");
      oauthUrl.searchParams.set("scope", scope);
      oauthUrl.searchParams.set("access_type", "offline");
      oauthUrl.searchParams.set("prompt", "consent");
      oauthUrl.searchParams.set("state", "google_business");

      window.location.href = oauthUrl.toString();
    } catch (err: any) {
      toast({
        title: "Failed to start Google authorization",
        description: err.message,
        variant: "destructive",
      });
      setConnectingPlatform(null);
    }
  };

  const handleConfirmConnect = async () => {
    if (!user || !selectedPlatform) return;
    setConnectingPlatform(selectedPlatform.id);

    try {
      if (selectedPlatform.connectMethod === "trustpilot_api") {
        if (!tpBusinessUnitId) {
          toast({
            title: "Business Unit ID required",
            description: "Please enter your Trustpilot Business Unit ID.",
            variant: "destructive",
          });
          setConnectingPlatform(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke("trustpilot-sync", {
          body: {
            action: "connect",
            business_unit_id: tpBusinessUnitId,
            business_name: tpBusinessName || "Trustpilot Account",
            api_key: tpApiKey || undefined,
          },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || "Failed to connect Trustpilot");
        }

        await fetchConnectedPlatforms();
        toast({
          title: "Trustpilot connected",
          description: "Syncing reviews now...",
        });
        setShowConnectDialog(false);

        // Auto-sync
        await handleSync("trustpilot");
      } else {
        // Manual connect
        const { data, error } = await supabase
          .from("connected_platforms")
          .insert({
            user_id: user.id,
            platform: selectedPlatform.id as any,
            platform_account_name: accountName || `${selectedPlatform.name} Account`,
            platform_account_id: accountId || undefined,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        setConnectedPlatforms((prev) => [...prev, data]);
        toast({
          title: "Platform connected",
          description: `${selectedPlatform.name} has been connected.`,
        });
        setShowConnectDialog(false);
      }
    } catch (err: any) {
      console.error("Error connecting platform:", err);
      toast({
        title: "Connection failed",
        description: err.message || "Failed to connect the platform.",
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleSync = async (platformId: string) => {
    setSyncingPlatform(platformId);
    try {
      let result: any;

      if (platformId === "google") {
        const { data, error } = await supabase.functions.invoke("google-oauth", {
          body: { action: "sync_reviews" },
        });
        if (error) throw error;
        result = data;
        toast({
          title: "Google reviews synced",
          description: `${result?.new_reviews || 0} new reviews imported.${result?.errors > 0 ? ` ${result.errors} error(s).` : ""}`,
          variant: result?.errors > 0 ? "destructive" : "default",
        });
      } else if (platformId === "trustpilot") {
        const { data, error } = await supabase.functions.invoke("trustpilot-sync", {
          body: { action: "sync_reviews" },
        });
        if (error) throw error;
        result = data;

        if (result?.error_details?.length > 0) {
          const firstErr = result.error_details[0];
          toast({
            title: "Trustpilot sync issue",
            description: firstErr.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Trustpilot reviews synced",
            description: `${result?.new_reviews || 0} new reviews imported.`,
          });
        }
      } else {
        // For manual platforms, just update timestamp
        const connection = connectedPlatforms.find((p) => p.platform === platformId);
        if (connection) {
          await supabase
            .from("connected_platforms")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", connection.id);
          toast({ title: "Sync updated", description: "Last synced timestamp refreshed." });
        }
      }

      await fetchConnectedPlatforms();
    } catch (err: any) {
      console.error("Sync error:", err);
      toast({
        title: "Sync failed",
        description: err.message || "Failed to sync reviews.",
        variant: "destructive",
      });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;

    try {
      // Delete the connection
      const { error } = await supabase
        .from("connected_platforms")
        .delete()
        .eq("id", connection.id);
      if (error) throw error;

      // Delete synced interactions
      await supabase
        .from("interactions")
        .delete()
        .eq("user_id", user!.id)
        .eq("platform", platformId as any);

      setConnectedPlatforms((prev) => prev.filter((p) => p.id !== connection.id));
      toast({
        title: "Platform disconnected",
        description: "The platform and all synced reviews have been removed.",
      });
    } catch (err: any) {
      console.error("Error disconnecting platform:", err);
      toast({
        title: "Error",
        description: "Failed to disconnect the platform.",
        variant: "destructive",
      });
    } finally {
      setDisconnectTarget(null);
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

  const groupedPlatforms = reviewPlatforms.reduce((acc, platform) => {
    if (!acc[platform.category]) acc[platform.category] = [];
    acc[platform.category].push(platform);
    return acc;
  }, {} as Record<string, ReviewPlatform[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Review Platforms
          </CardTitle>
          <CardDescription>
            Connect your review platforms to monitor and respond to customer feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(groupedPlatforms).map(([category, platforms]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {categoryLabels[category]}
              </h3>
              <div className="grid gap-3">
                {platforms.map((platform) => {
                  const connected = isConnected(platform.id);
                  const connection = getConnection(platform.id);
                  const isSyncing = syncingPlatform === platform.id;
                  const isConnecting = connectingPlatform === platform.id;

                  return (
                    <div
                      key={platform.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg ${platform.color} text-white flex items-center justify-center`}
                        >
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
                            {(platform.connectMethod === "google_oauth" || platform.connectMethod === "trustpilot_api") && !connected && (
                              <Badge variant="outline" className="text-xs text-blue-500 border-blue-200">
                                Live Sync
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
                            {(platform.connectMethod === "google_oauth" || platform.connectMethod === "trustpilot_api") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSync(platform.id)}
                                disabled={isSyncing}
                                title="Sync reviews now"
                              >
                                <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                                {isSyncing ? "Syncing..." : "Sync"}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(platform.setupUrl, "_blank")}
                              title="Open platform"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDisconnectTarget(platform.id)}
                              className="text-destructive hover:text-destructive"
                              title="Disconnect"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnect(platform)}
                            disabled={isConnecting}
                          >
                            {isConnecting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            {isConnecting ? "Connecting..." : "Connect"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlatform && (
                <div
                  className={`h-8 w-8 rounded-lg ${selectedPlatform.color} text-white flex items-center justify-center`}
                >
                  {selectedPlatform.icon}
                </div>
              )}
              Connect {selectedPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPlatform?.connectMethod === "trustpilot_api"
                ? "Enter your Trustpilot Business Unit ID to start syncing reviews."
                : `Enter your ${selectedPlatform?.name} account details.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPlatform?.connectMethod === "trustpilot_api" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tp-business-unit-id">
                    Business Unit ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tp-business-unit-id"
                    placeholder="e.g. 5a123abc456def789012345b"
                    value={tpBusinessUnitId}
                    onChange={(e) => setTpBusinessUnitId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in your Trustpilot Business account under Settings → API.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tp-business-name">Business Name</Label>
                  <Input
                    id="tp-business-name"
                    placeholder="Your business name on Trustpilot"
                    value={tpBusinessName}
                    onChange={(e) => setTpBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tp-api-key">API Key (Optional)</Label>
                  <Input
                    id="tp-api-key"
                    placeholder="Your Trustpilot API key"
                    value={tpApiKey}
                    onChange={(e) => setTpApiKey(e.target.value)}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for syncing reviews. Get it from{" "}
                    <a href="https://businessapp.b2b.trustpilot.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Trustpilot Developer Portal
                    </a>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder={`Your ${selectedPlatform?.name} business name`}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account ID (Optional)</Label>
                  <Input
                    id="accountId"
                    placeholder="Business ID or profile URL"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  />
                </div>
              </>
            )}

            {selectedPlatform?.helpText && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-blue-700 dark:text-blue-300">{selectedPlatform.helpText}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmConnect}
              disabled={connectingPlatform !== null}
            >
              {connectingPlatform ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Connect Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect platform?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connection and delete all synced reviews from this platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => disconnectTarget && handleDisconnect(disconnectTarget)}
            >
              Disconnect & Delete Reviews
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
