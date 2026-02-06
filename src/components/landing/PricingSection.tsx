import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

const planFeatures = {
  starter: [
    { text: "1,000 interactions/month", included: true },
    { text: "3 connected platforms", included: true },
    { text: "Basic AI responses", included: true },
    { text: "Review management", included: true },
    { text: "Email support", included: true },
    { text: "Chatbot widget", included: false },
    { text: "Automations", included: false },
    { text: "Lead generation", included: false },
  ],
  professional: [
    { text: "5,000 interactions/month", included: true },
    { text: "7 connected platforms", included: true },
    { text: "Advanced AI with brand voice", included: true },
    { text: "Review management", included: true },
    { text: "Priority support", included: true },
    { text: "Chatbot widget", included: true },
    { text: "Automations", included: true },
    { text: "Lead generation", included: true },
    { text: "Full analytics", included: true },
    { text: "5 team seats", included: true },
  ],
  agency: [
    { text: "Unlimited interactions", included: true },
    { text: "Unlimited platforms", included: true },
    { text: "Custom AI training", included: true },
    { text: "All Professional features", included: true },
    { text: "CRM integrations", included: true },
    { text: "API access", included: true },
    { text: "White-label options", included: true },
    { text: "15 team seats", included: true },
    { text: "Dedicated support", included: true },
  ],
};

export function PricingSection() {
  const { user } = useAuth();
  const { plans, createCheckoutSession, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; period: "monthly" | "annual" } | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // After auth completes, trigger checkout if a plan was selected
  useEffect(() => {
    if (user && selectedPlan && !subLoading) {
      handleCheckout(selectedPlan.id, selectedPlan.period);
      setSelectedPlan(null);
    }
  }, [user, selectedPlan, subLoading]);

  const handlePlanSelect = async (planName: string) => {
    const plan = plans.find(p => p.name === planName);
    if (!plan) return;

    if (!user) {
      // Store selected plan and show auth modal
      setSelectedPlan({ id: plan.id, period: isAnnual ? "annual" : "monthly" });
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
      description: "For small businesses getting started",
      features: planFeatures.starter,
      popular: false,
      plan: starterPlan,
    },
    {
      name: "Professional",
      planKey: "professional",
      monthlyPrice: professionalPlan?.monthly_price || 199,
      annualPrice: professionalPlan?.annual_price || 159,
      description: "For growing businesses",
      features: planFeatures.professional,
      popular: true,
      plan: professionalPlan,
    },
    {
      name: "Agency",
      planKey: "agency",
      monthlyPrice: agencyPlan?.monthly_price || 499,
      annualPrice: agencyPlan?.annual_price || 399,
      description: "For agencies and large teams",
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent{" "}
              <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Start with a 14-day free trial on any plan. No credit card required.
            </p>
          </div>

          {/* Monthly/Annual Toggle */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                    <span className="text-4xl font-bold">
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
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  onClick={() => handlePlanSelect(plan.planKey)}
                  disabled={loadingPlan === plan.plan?.id}
                >
                  {loadingPlan === plan.plan?.id ? "Loading..." : "Start Free Trial"}
                </Button>
              </div>
            ))}

            {/* Enterprise Card */}
            <div className="relative p-6 rounded-2xl bg-card border border-border flex flex-col">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  For large organizations
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                  <span>Everything in Agency</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                  <span>Unlimited team seats</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                  <span>Custom AI models</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
                  <span>On-premise deployment</span>
                </li>
              </ul>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "mailto:sales@socialrep.ai"}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={authModal} 
        onClose={() => {
          setAuthModal(false);
          setSelectedPlan(null);
        }} 
        defaultTab="signup" 
      />
    </>
  );
}