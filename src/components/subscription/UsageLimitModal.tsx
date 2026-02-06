import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, AlertTriangle } from "lucide-react";

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "ai_responses" | "platforms" | "team_seats";
  currentCount?: number;
}

export function UsageLimitModal({ isOpen, onClose, limitType, currentCount = 0 }: UsageLimitModalProps) {
  const navigate = useNavigate();
  const { plan, usage, plans, createCheckoutSession } = useSubscription();

  const getConfig = () => {
    switch (limitType) {
      case "ai_responses":
        return {
          title: "AI Response Limit Reached",
          description: `You've used all ${plan?.max_ai_responses || 0} AI responses this month.`,
          used: usage?.ai_responses_used || 0,
          limit: plan?.max_ai_responses || 0,
          upgradeText: "Upgrade for more AI responses",
        };
      case "platforms":
        return {
          title: "Platform Limit Reached",
          description: `Your ${plan?.display_name || "current"} plan supports ${plan?.max_platforms || 0} platforms.`,
          used: currentCount,
          limit: plan?.max_platforms || 0,
          upgradeText: "Upgrade to connect more platforms",
        };
      case "team_seats":
        return {
          title: "Team Seat Limit Reached",
          description: `Your plan includes ${plan?.max_team_seats || 0} team seat${(plan?.max_team_seats || 0) !== 1 ? "s" : ""}.`,
          used: currentCount,
          limit: plan?.max_team_seats || 0,
          upgradeText: "Upgrade to add team members",
        };
    }
  };

  const config = getConfig();
  const percentUsed = config.limit > 0 ? (config.used / config.limit) * 100 : 100;

  // Find next tier plan
  const currentPlanIndex = plans.findIndex(p => p.id === plan?.id);
  const nextPlan = plans[currentPlanIndex + 1];

  const handleUpgrade = async () => {
    if (nextPlan) {
      const url = await createCheckoutSession(nextPlan.id, "monthly");
      if (url) {
        window.location.href = url;
      } else {
        navigate("/dashboard/settings?tab=billing");
      }
    } else {
      navigate("/dashboard/settings?tab=billing");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-14 w-14 rounded-full bg-sentiment-negative/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-sentiment-negative" />
          </div>
          <DialogTitle className="text-center text-xl">{config.title}</DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usage</span>
              <span className="font-medium">
                {config.used} / {config.limit === -1 ? "∞" : config.limit}
              </span>
            </div>
            <Progress 
              value={percentUsed} 
              className="h-3"
              style={{
                ["--progress-background" as string]: percentUsed >= 100 
                  ? "hsl(var(--sentiment-negative))" 
                  : percentUsed >= 80 
                  ? "hsl(var(--sentiment-neutral))" 
                  : "hsl(var(--primary))"
              }}
            />
          </div>

          {nextPlan && (
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-1">
                {nextPlan.display_name} Plan includes:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {limitType === "ai_responses" && (
                  <li>• {nextPlan.max_ai_responses === -1 ? "Unlimited" : nextPlan.max_ai_responses.toLocaleString()} AI responses/month</li>
                )}
                {limitType === "platforms" && (
                  <li>• {nextPlan.max_platforms === -1 ? "Unlimited" : nextPlan.max_platforms} platform connections</li>
                )}
                {limitType === "team_seats" && (
                  <li>• {nextPlan.max_team_seats === -1 ? "Unlimited" : nextPlan.max_team_seats} team seats</li>
                )}
              </ul>
              <p className="text-sm font-semibold mt-2">
                ${nextPlan.monthly_price}/month
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} variant="hero">
            <Sparkles className="h-4 w-4 mr-2" />
            {config.upgradeText}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}