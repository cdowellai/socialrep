import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useSubscription } from "@/hooks/useSubscription";
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
  AlertTriangle,
  Calendar,
  ExternalLink,
} from "lucide-react";

export function BillingSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    subscription,
    plan,
    plans,
    usage,
    loading,
    isTrialing,
    isPastDue,
    trialDaysRemaining,
    createCheckoutSession,
    createPortalSession,
  } = useSubscription();

  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState(0);
  const [teamSeats, setTeamSeats] = useState(1);

  useEffect(() => {
    if (user) {
      fetchUsageData();
    }
  }, [user]);

  const fetchUsageData = async () => {
    if (!user) return;
    
    // Get connected platforms count
    const { count: platformsCount } = await supabase
      .from("connected_platforms")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setConnectedPlatforms(platformsCount || 0);

    // Get team members count
    const { data: teamData } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .not("accepted_at", "is", null)
      .limit(1)
      .single();

    if (teamData?.team_id) {
      const { count } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", teamData.team_id)
        .not("accepted_at", "is", null);
      setTeamSeats(count || 1);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const url = await createCheckoutSession(planId, isAnnual ? "annual" : "monthly");
      if (url) {
        window.location.href = url;
      } else {
        toast({
          title: "Error",
          description: "Could not create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const url = await createPortalSession();
      if (url) {
        window.location.href = url;
      } else {
        toast({
          title: "Error",
          description: "Could not open billing portal. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getProgressColor = (used: number, max: number) => {
    if (max === -1) return "bg-primary"; // Unlimited
    const percent = (used / max) * 100;
    if (percent >= 100) return "bg-sentiment-negative";
    if (percent >= 80) return "bg-sentiment-neutral";
    return "bg-primary";
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

  // Filter out enterprise plan for display
  const displayPlans = plans.filter(p => p.name !== "enterprise");

  return (
    <div className="space-y-6">
      {/* Trial/Past Due Alerts */}
      {isTrialing && (
        <Alert className="border-primary/50 bg-primary/5">
          <Calendar className="h-4 w-4" />
          <AlertTitle>Free Trial Active</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your free trial ends in {trialDaysRemaining} days. Add a payment method to continue after your trial.
            </span>
            <Button size="sm" variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
              {portalLoading ? "Loading..." : "Add Payment Method"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isPastDue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment Failed</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your last payment failed. Please update your payment method to continue using all features.
            </span>
            <Button size="sm" variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
              Update Payment
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      {subscription && plan && (
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
                    {plan.name === "agency" ? (
                      <Crown className="h-6 w-6 text-primary" />
                    ) : plan.name === "professional" ? (
                      <Zap className="h-6 w-6 text-primary" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{plan.display_name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      ${subscription.billing_period === "annual" ? plan.annual_price : plan.monthly_price}/month
                      {subscription.billing_period === "annual" && " (billed annually)"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    subscription.status === "active"
                      ? "bg-sentiment-positive/10 text-sentiment-positive"
                      : subscription.status === "trialing"
                      ? "bg-primary/10 text-primary"
                      : subscription.status === "past_due"
                      ? "bg-sentiment-negative/10 text-sentiment-negative"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {subscription.status === "trialing" ? "Trial" : 
                   subscription.status === "active" ? "Active" :
                   subscription.status === "past_due" ? "Past Due" : "Canceled"}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {portalLoading ? "Loading..." : "Manage Billing"}
                </Button>
                {plan.name !== "agency" && (
                  <Button variant="hero" onClick={() => {
                    const nextPlan = displayPlans.find(p => p.monthly_price > plan.monthly_price);
                    if (nextPlan) handleUpgrade(nextPlan.id);
                  }}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your resource consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>AI Responses</span>
                </div>
                <span className="font-medium">
                  {usage?.ai_responses_used || 0}/{plan?.max_ai_responses === -1 ? "∞" : plan?.max_ai_responses || 0}
                </span>
              </div>
              <Progress
                value={plan?.max_ai_responses === -1 ? 0 : ((usage?.ai_responses_used || 0) / (plan?.max_ai_responses || 1)) * 100}
                className={`h-2 ${getProgressColor(usage?.ai_responses_used || 0, plan?.max_ai_responses || 0)}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span>Platforms</span>
                </div>
                <span className="font-medium">
                  {connectedPlatforms}/{plan?.max_platforms === -1 ? "∞" : plan?.max_platforms || 3}
                </span>
              </div>
              <Progress
                value={plan?.max_platforms === -1 ? 0 : (connectedPlatforms / (plan?.max_platforms || 1)) * 100}
                className={`h-2 ${getProgressColor(connectedPlatforms, plan?.max_platforms || 0)}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Team Seats</span>
                </div>
                <span className="font-medium">
                  {teamSeats}/{plan?.max_team_seats === -1 ? "∞" : plan?.max_team_seats || 1}
                </span>
              </div>
              <Progress
                value={plan?.max_team_seats === -1 ? 0 : (teamSeats / (plan?.max_team_seats || 1)) * 100}
                className={`h-2 ${getProgressColor(teamSeats, plan?.max_team_seats || 0)}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>Interactions</span>
                </div>
                <span className="font-medium">
                  {usage?.interactions_used || 0}/{plan?.max_interactions === -1 ? "∞" : plan?.max_interactions || 100}
                </span>
              </div>
              <Progress
                value={plan?.max_interactions === -1 ? 0 : ((usage?.interactions_used || 0) / (plan?.max_interactions || 1)) * 100}
                className={`h-2 ${getProgressColor(usage?.interactions_used || 0, plan?.max_interactions || 0)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compare Plans</CardTitle>
              <CardDescription>Choose the plan that fits your needs</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!isAnnual ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-sm ${isAnnual ? "font-medium" : "text-muted-foreground"}`}>Annual</span>
              {isAnnual && (
                <Badge className="bg-sentiment-positive text-white">Save 20%</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayPlans.map((p) => {
              const isCurrentPlan = plan?.id === p.id;
              const price = isAnnual ? p.annual_price : p.monthly_price;
              
              return (
                <div
                  key={p.id}
                  className={`relative p-6 rounded-lg border ${
                    p.name === "professional" ? "border-primary bg-primary/5" : "border-border"
                  } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                >
                  {p.name === "professional" && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2.5 right-4 bg-accent text-accent-foreground">
                      Current
                    </Badge>
                  )}
                  <h3 className="font-semibold text-lg">{p.display_name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/mo</span>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">billed annually</p>
                    )}
                  </div>

                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sentiment-positive" />
                      {p.max_platforms === -1 ? "Unlimited" : p.max_platforms} platforms
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sentiment-positive" />
                      {p.max_team_seats === -1 ? "Unlimited" : p.max_team_seats} team seats
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sentiment-positive" />
                      {p.max_ai_responses === -1 ? "Unlimited" : p.max_ai_responses.toLocaleString()} AI responses/mo
                    </li>
                    <li className="flex items-center gap-2">
                      {(p.features as any).chatbot ? (
                        <Check className="h-4 w-4 text-sentiment-positive" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      Chatbot widget
                    </li>
                    <li className="flex items-center gap-2">
                      {(p.features as any).automations ? (
                        <Check className="h-4 w-4 text-sentiment-positive" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      Automations
                    </li>
                    <li className="flex items-center gap-2">
                      {(p.features as any).leads ? (
                        <Check className="h-4 w-4 text-sentiment-positive" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      Lead generation
                    </li>
                  </ul>

                  <Button
                    variant={
                      isCurrentPlan
                        ? "outline"
                        : p.name === "professional"
                        ? "hero"
                        : "default"
                    }
                    className="w-full"
                    disabled={isCurrentPlan || loadingPlan === p.id}
                    onClick={() => handleUpgrade(p.id)}
                  >
                    {loadingPlan === p.id 
                      ? "Loading..." 
                      : isCurrentPlan 
                      ? "Current Plan" 
                      : plan && p.monthly_price < plan.monthly_price 
                      ? "Downgrade" 
                      : "Upgrade"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}