import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeaturePaywallProps {
  feature: string;
  description: string;
  requiredPlan: string;
  children?: React.ReactNode;
}

export function FeaturePaywall({ feature, description, requiredPlan, children }: FeaturePaywallProps) {
  const navigate = useNavigate();
  const { plans, createCheckoutSession } = useSubscription();

  const targetPlan = plans.find(p => p.name === requiredPlan.toLowerCase());

  const handleUpgrade = async () => {
    if (targetPlan) {
      const url = await createCheckoutSession(targetPlan.id, "monthly");
      if (url) {
        window.location.href = url;
      } else {
        navigate("/dashboard/settings?tab=billing");
      }
    } else {
      navigate("/dashboard/settings?tab=billing");
    }
  };

  return (
    <div className="relative min-h-[400px]">
      {/* Blurred background content */}
      {children && (
        <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none overflow-hidden">
          {children}
        </div>
      )}
      
      {/* Paywall overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
        <Card className="max-w-md mx-4 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{feature}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Available on</p>
              <p className="font-semibold text-lg">{requiredPlan} Plan & above</p>
              {targetPlan && (
                <p className="text-sm text-muted-foreground mt-1">
                  Starting at ${targetPlan.monthly_price}/mo
                </p>
              )}
            </div>
            <Button onClick={handleUpgrade} className="w-full" variant="hero">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to {requiredPlan}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              14-day free trial included • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsPaywall() {
  const navigate = useNavigate();
  const { plans, createCheckoutSession } = useSubscription();

  const professionalPlan = plans.find(p => p.name === "professional");

  const handleUpgrade = async () => {
    if (professionalPlan) {
      const url = await createCheckoutSession(professionalPlan.id, "monthly");
      if (url) {
        window.location.href = url;
      } else {
        navigate("/dashboard/settings?tab=billing");
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-transparent z-10">
        <Card className="max-w-lg mx-4 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <CardTitle>Unlock Full Analytics</CardTitle>
            <CardDescription>
              Get detailed insights, exportable reports, and team performance tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Detailed platform breakdowns
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Team performance metrics
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Exportable PDF reports
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Sentiment trend analysis
              </li>
            </ul>
            <Button onClick={handleUpgrade} className="w-full" variant="hero">
              Upgrade to Professional
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}