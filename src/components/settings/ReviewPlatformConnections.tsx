import { useState, useEffect } from "react";
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
}

const reviewPlatforms: ReviewPlatform[] = [
  {
    id: "trustpilot",
    name: "Trustpilot",
    description: "Consumer reviews and ratings platform",
    icon: <Star className="h-5 w-5" />,
    color: "bg-emerald-500",
    category: "business",
    setupUrl: "https://business.trustpilot.com/",
  },
  {
    id: "google",
    name: "Google Business",
    description: "Google Maps and Search reviews",
    icon: <Building2 className="h-5 w-5" />,
    color: "bg-blue-500",
    category: "business",
    setupUrl: "https://business.google.com/",
  },
  {
    id: "yelp",
    name: "Yelp",
    description: "Local business reviews",
    icon: <Star className="h-5 w-5" />,
    color: "bg-red-500",
    category: "business",
    setupUrl: "https://biz.yelp.com/",
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    description: "Travel and hospitality reviews",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "bg-green-600",
    category: "business",
    setupUrl: "https://www.tripadvisor.com/Owners",
  },
  {
    id: "g2",
    name: "G2",
    description: "B2B software reviews",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-orange-500",
    category: "software",
    setupUrl: "https://sell.g2.com/",
  },
  {
    id: "capterra",
    name: "Capterra",
    description: "Software comparison and reviews",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-blue-600",
    category: "software",
    setupUrl: "https://www.capterra.com/vendors/",
  },
  {
    id: "bbb",
    name: "Better Business Bureau",
    description: "Business accreditation and reviews",
    icon: <Building2 className="h-5 w-5" />,
    color: "bg-blue-800",
    category: "business",
    setupUrl: "https://www.bbb.org/get-accredited",
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    description: "Employee and company reviews",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-green-500",
    category: "business",
    setupUrl: "https://www.glassdoor.com/employers/",
  },
  {
    id: "amazon",
    name: "Amazon Reviews",
    description: "Product reviews on Amazon",
    icon: <ShoppingBag className="h-5 w-5" />,
    color: "bg-yellow-500",
    category: "consumer",
    setupUrl: "https://sellercentral.amazon.com/",
  },
  {
    id: "appstore",
    name: "Apple App Store",
    description: "iOS app reviews and ratings",
    icon: <Smartphone className="h-5 w-5" />,
    color: "bg-gray-800",
    category: "app",
    setupUrl: "https://appstoreconnect.apple.com/",
  },
  {
    id: "playstore",
    name: "Google Play Store",
    description: "Android app reviews and ratings",
    icon: <Smartphone className="h-5 w-5" />,
    color: "bg-green-600",
    category: "app",
    setupUrl: "https://play.google.com/console/",
  },
  {
    id: "facebook",
    name: "Facebook Reviews",
    description: "Facebook page recommendations",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "bg-blue-600",
    category: "business",
    setupUrl: "https://business.facebook.com/",
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
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<ReviewPlatform | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (user) {
      fetchConnectedPlatforms();
    }
  }, [user]);

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

  const handleConnect = (platform: ReviewPlatform) => {
    setSelectedPlatform(platform);
    setAccountName("");
    setAccountId("");
    setShowConnectDialog(true);
  };

  const handleConfirmConnect = async () => {
    if (!user || !selectedPlatform) return;

    setConnectingPlatform(selectedPlatform.id);
    try {
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
        description: `${selectedPlatform.name} has been connected successfully.`,
      });
      setShowConnectDialog(false);
    } catch (err) {
      console.error("Error connecting platform:", err);
      toast({
        title: "Connection failed",
        description: "Failed to connect the platform. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;

    try {
      const { error } = await supabase
        .from("connected_platforms")
        .delete()
        .eq("id", connection.id);

      if (error) throw error;

      setConnectedPlatforms((prev) => prev.filter((p) => p.id !== connection.id));
      toast({
        title: "Platform disconnected",
        description: "The platform has been disconnected.",
      });
    } catch (err) {
      console.error("Error disconnecting platform:", err);
      toast({
        title: "Error",
        description: "Failed to disconnect the platform.",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (platformId: string) => {
    const connection = connectedPlatforms.find((p) => p.platform === platformId);
    if (!connection) return;

    try {
      const { error } = await supabase
        .from("connected_platforms")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", connection.id);

      if (error) throw error;

      setConnectedPlatforms((prev) =>
        prev.map((p) =>
          p.id === connection.id
            ? { ...p, last_synced_at: new Date().toISOString() }
            : p
        )
      );

      toast({
        title: "Sync initiated",
        description: "Reviews are being synced from the platform.",
      });
    } catch (err) {
      console.error("Error syncing platform:", err);
    }
  };

  const isConnected = (platformId: string) => {
    return connectedPlatforms.some((p) => p.platform === platformId && p.is_active);
  };

  const getConnection = (platformId: string) => {
    return connectedPlatforms.find((p) => p.platform === platformId);
  };

  const groupedPlatforms = reviewPlatforms.reduce((acc, platform) => {
    if (!acc[platform.category]) {
      acc[platform.category] = [];
    }
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
                          </div>
                          {connected && connection?.platform_account_name ? (
                            <p className="text-sm text-muted-foreground">
                              {connection.platform_account_name}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {platform.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {connected ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSync(platform.id)}
                              title="Sync reviews"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
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
                              onClick={() => handleDisconnect(platform.id)}
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
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
              Enter your {selectedPlatform?.name} account details to start monitoring reviews.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="text-muted-foreground">
                Note: Full API integration requires authentication through{" "}
                <a
                  href={selectedPlatform?.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {selectedPlatform?.name}'s business portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
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
    </>
  );
}
