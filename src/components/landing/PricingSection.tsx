import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const planFeatures = {
  starter: [
    { text: "1,000 interactions/month", included: true },
    { text: "3 connected platforms", included: true },
    { text: "Basic AI responses", included: true },
    { text: "Review management", included: true },
    { text: "Email support", included: true },
    { text: "Chatbot widget", included: false },
    { text: "Automations", included: false },
  ],
  professional: [
    { text: "5,000 interactions/month", included: true },
    { text: "7 connected platforms", included: true },
    { text: "Advanced AI + brand voice", included: true },
    { text: "Chatbot widget", included: true },
    { text: "Automations & lead gen", included: true },
    { text: "Full analytics & reports", included: true },
    { text: "5 team seats", included: true },
  ],
  agency: [
    { text: "Unlimited interactions", included: true },
    { text: "Unlimited platforms", included: true },
    { text: "Custom AI training", included: true },
    { text: "White-label reports", included: true },
    { text: "CRM integrations + API", included: true },
    { text: "15 team seats", included: true },
    { text: "Dedicated support", included: true },
  ],
};

export function PricingSection() {
  const { user } = useAuth();
  const { plans, createCheckoutSession } = useSubscription();
  const [authModal, setAuthModal] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planName: string) => {
    const plan = plans.find(p => p.name === planName);
    if (!plan) return;

    if (!user) {
      localStorage.setItem("pending_checkout_plan", plan.id);
      localStorage.setItem("pending_checkout_period", isAnnual ? "annual" : "monthly");
      setAuthModal(true);
      return;
    }

    await handleCheckout(plan.id, isAnnual ? "annual" : "monthly");
  };

  const handleCheckout = async (planId: string, period: "monthly" | "annual") => {
    setLoadingPlan(planId);
    try {
      const url = await createCheckoutSession(planId, period);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const starterPlan = plans.find(p => p.name === "starter");
  const professionalPlan = plans.find(p => p.name === "professional");
  const agencyPlan = plans.find(p => p.name === "agency");

  const displayPlans = [
    {
      name: "Starter",
      planKey: "starter",
      monthlyPrice: starterPlan?.monthly_price || 79,
      annualPrice: starterPlan?.annual_price || 63,
      description: "For small businesses getting started.",
      features: planFeatures.starter,
      popular: false,
      plan: starterPlan,
    },
    {
      name: "Professional",
      planKey: "professional",
      monthlyPrice: professionalPlan?.monthly_price || 199,
      annualPrice: professionalPlan?.annual_price || 159,
      description: "For growing businesses and small teams.",
      features: planFeatures.professional,
      popular: true,
      plan: professionalPlan,
    },
    {
      name: "Agency",
      planKey: "agency",
      monthlyPrice: agencyPlan?.monthly_price || 499,
      annualPrice: agencyPlan?.annual_price || 399,
      description: "For agencies managing multiple clients.",
      features: planFeatures.agency,
      popular: false,
      plan: agencyPlan,
    },
  ];

  return (
    <>
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <p className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
              Simple pricing
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
              Start free. Upgrade when you're ready.
            </h2>
            <p className="text-lg text-muted-foreground">
              14-day free trial on every plan. No credit card required.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-sentiment-positive text-white">
                Save 20%
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {displayPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl bg-card border ${
                  plan.popular
                    ? "border-primary shadow-glow"
                    : "border-border"
                } flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-muted-foreground mt-1">
                      billed annually
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={plan.popular ? "bg-gradient-primary hover:opacity-90 text-white" : ""}
                  onClick={() => handlePlanSelect(plan.planKey)}
                  disabled={loadingPlan === plan.plan?.id}
                >
                  {loadingPlan === plan.plan?.id ? "Loading..." : "Start Free Trial"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={authModal} 
        onClose={() => {
          setAuthModal(false);
          localStorage.removeItem("pending_checkout_plan");
          localStorage.removeItem("pending_checkout_period");
        }} 
        defaultTab="signup" 
      />
    </>
  );
}
