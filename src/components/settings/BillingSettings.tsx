import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Check,
  X,
  ArrowUpRight,
  Download,
  Users,
  Link2,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";

interface PlanTier {
  name: string;
  price: number;
  features: {
    platforms: number;
    seats: number;
    aiResponses: number;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
}

const plans: PlanTier[] = [
  {
    name: "Starter",
    price: 79,
    features: {
      platforms: 3,
      seats: 2,
      aiResponses: 500,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  {
    name: "Professional",
    price: 199,
    features: {
      platforms: 10,
      seats: 5,
      aiResponses: 2500,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
    },
    popular: true,
  },
  {
    name: "Agency",
    price: 499,
    features: {
      platforms: -1, // Unlimited
      seats: 15,
      aiResponses: 10000,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
];

interface UsageMetrics {
  connectedPlatforms: number;
  maxPlatforms: number;
  teamSeats: number;
  maxSeats: number;
  aiResponses: number;
  maxAiResponses: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
}

export function BillingSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("inactive");
  const [usage, setUsage] = useState<UsageMetrics>({
    connectedPlatforms: 0,
    maxPlatforms: 2,
    teamSeats: 1,
    maxSeats: 1,
    aiResponses: 0,
    maxAiResponses: 100,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
    if (!user) return;
    try {
      // Get profile with billing info
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("plan, subscription_status, monthly_interactions_used, monthly_interactions_limit")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      setCurrentPlan(profile?.plan || "free");
      setSubscriptionStatus(profile?.subscription_status || "inactive");

      // Get connected platforms count
      const { count: platformsCount } = await supabase
        .from("connected_platforms")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get team members count
      const { data: teamData } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .not("accepted_at", "is", null)
        .limit(1)
        .single();

      let seatsCount = 1;
      if (teamData?.team_id) {
        const { count } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", teamData.team_id)
          .not("accepted_at", "is", null);
        seatsCount = count || 1;
      }

      // Set usage based on plan
      const planLimits = {
        free: { platforms: 2, seats: 1, ai: 100 },
        starter: { platforms: 3, seats: 2, ai: 500 },
        professional: { platforms: 10, seats: 5, ai: 2500 },
        agency: { platforms: 999, seats: 15, ai: 10000 },
      };
      const limits = planLimits[profile?.plan as keyof typeof planLimits] || planLimits.free;

      setUsage({
        connectedPlatforms: platformsCount || 0,
        maxPlatforms: limits.platforms,
        teamSeats: seatsCount,
        maxSeats: limits.seats,
        aiResponses: profile?.monthly_interactions_used || 0,
        maxAiResponses: profile?.monthly_interactions_limit || limits.ai,
      });

      // Mock invoices for demo
      setInvoices([
        { id: "inv_001", date: "2024-02-01", amount: 79, status: "paid" },
        { id: "inv_002", date: "2024-01-01", amount: 79, status: "paid" },
        { id: "inv_003", date: "2023-12-01", amount: 79, status: "paid" },
      ]);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Upgrade to " + planName,
      description: "Stripe checkout will be implemented here. Contact support to upgrade.",
    });
  };

  const handleManageBilling = () => {
    toast({
      title: "Manage Billing",
      description: "Stripe customer portal will be implemented here.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const currentPlanDetails = plans.find((p) => p.name.toLowerCase() === currentPlan) || null;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Current Plan
          </CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-primary/20 bg-accent/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  {currentPlan === "free" ? (
                    <Sparkles className="h-6 w-6 text-primary" />
                  ) : currentPlan === "agency" ? (
                    <Crown className="h-6 w-6 text-primary" />
                  ) : (
                    <Zap className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg capitalize">{currentPlan} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan === "free"
                      ? "Free forever"
                      : `$${currentPlanDetails?.price || 0}/month`}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  subscriptionStatus === "active"
                    ? "bg-sentiment-positive/10 text-sentiment-positive"
                    : "bg-muted text-muted-foreground"
                }
              >
                {subscriptionStatus === "active" ? "Active" : "Free Tier"}
              </Badge>
            </div>

            {currentPlan !== "agency" && (
              <Button variant="hero" className="w-full" onClick={() => handleUpgrade("Professional")}>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your resource consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span>Connected Platforms</span>
                </div>
                <span className="font-medium">
                  {usage.connectedPlatforms}/{usage.maxPlatforms === 999 ? "∞" : usage.maxPlatforms}
                </span>
              </div>
              <Progress
                value={(usage.connectedPlatforms / (usage.maxPlatforms === 999 ? 100 : usage.maxPlatforms)) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Team Seats</span>
                </div>
                <span className="font-medium">
                  {usage.teamSeats}/{usage.maxSeats}
                </span>
              </div>
              <Progress value={(usage.teamSeats / usage.maxSeats) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>AI Responses</span>
                </div>
                <span className="font-medium">
                  {usage.aiResponses}/{usage.maxAiResponses}
                </span>
              </div>
              <Progress value={(usage.aiResponses / usage.maxAiResponses) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-lg border ${
                  plan.popular ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sentiment-positive" />
                    {plan.features.platforms === -1 ? "Unlimited" : plan.features.platforms} platforms
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sentiment-positive" />
                    {plan.features.seats} team seats
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sentiment-positive" />
                    {plan.features.aiResponses.toLocaleString()} AI responses/mo
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.features.customBranding ? (
                      <Check className="h-4 w-4 text-sentiment-positive" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    Custom branding
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.features.apiAccess ? (
                      <Check className="h-4 w-4 text-sentiment-positive" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    API access
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.features.prioritySupport ? (
                      <Check className="h-4 w-4 text-sentiment-positive" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    Priority support
                  </li>
                </ul>

                <Button
                  variant={
                    currentPlan === plan.name.toLowerCase()
                      ? "outline"
                      : plan.popular
                      ? "hero"
                      : "default"
                  }
                  className="w-full"
                  disabled={currentPlan === plan.name.toLowerCase()}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {currentPlan === plan.name.toLowerCase() ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>Download past invoices</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                Manage Billing
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>${invoice.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          invoice.status === "paid"
                            ? "text-sentiment-positive border-sentiment-positive"
                            : invoice.status === "pending"
                            ? "text-sentiment-neutral border-sentiment-neutral"
                            : "text-sentiment-negative border-sentiment-negative"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
