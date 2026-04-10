import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const planFeatures = {
  starter: [
    { text: "1,000 interactions/month", included: true },
    { text: "3 connected platforms", included: true },
    { text: "AI-powered responses", included: true },
    { text: "Review management", included: true },
    { text: "Email support", included: true },
    { text: "Chatbot widget", included: false },
    { text: "Automations", included: false },
    { text: "Team seats", included: false },
  ],
  professional: [
    { text: "5,000 interactions/month", included: true },
    { text: "7 connected platforms", included: true },
    { text: "Advanced AI with brand voice", included: true },
    { text: "Chatbot widget", included: true },
    { text: "Automations & lead generation", included: true },
    { text: "Full analytics & PDF reports", included: true },
    { text: "5 team seats", included: true },
    { text: "Priority support", included: true },
  ],
  agency: [
    { text: "Unlimited interactions", included: true },
    { text: "Unlimited platforms", included: true },
    { text: "Custom AI per workspace", included: true },
    { text: "White-label reports", included: true },
    { text: "CRM integrations + API", included: true },
    { text: "15 team seats", included: true },
    { text: "Client workspaces", included: true },
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
      const url = await createCheckoutSession(planId, period, true);
      if (url) window.location.href = url;
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
      description: "For businesses getting started with reputation management.",
      features: planFeatures.starter,
      popular: false,
      plan: starterPlan,
    },
    {
      name: "Professional",
      planKey: "professional",
      monthlyPrice: professionalPlan?.monthly_price || 199,
      annualPrice: professionalPlan?.annual_price || 159,
      description: "For growing businesses that need the full platform.",
      features: planFeatures.professional,
      popular: true,
      plan: professionalPlan,
    },
    {
      name: "Agency",
      planKey: "agency",
      monthlyPrice: agencyPlan?.monthly_price || 499,
      annualPrice: agencyPlan?.annual_price || 399,
      description: "For teams and agencies managing multiple accounts.",
      features: planFeatures.agency,
      popular: false,
      plan: agencyPlan,
    },
  ];

  return (
    <>
      <section id="pricing" className="py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">Pricing</p>
            <h2 className="font-display text-display-sm md:text-display-md mb-5">
              Simple plans that scale with you.
            </h2>
            <p className="text-lg text-muted-foreground">
              Start with a 14-day free trial on any plan.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mb-14">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
            {isAnnual && (
              <Badge className="bg-sentiment-positive text-primary-foreground border-0">Save 20%</Badge>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {displayPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-7 rounded-2xl bg-card border-2 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                    : "border-border/60 hover:border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="font-display font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-display">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  {isAnnual && <p className="text-xs text-muted-foreground mt-1">billed annually</p>}
                  <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-sentiment-positive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-sentiment-positive" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="h-3 w-3 text-muted-foreground/40" />
                        </div>
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/50"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                  onClick={() => handlePlanSelect(plan.planKey)}
                  disabled={loadingPlan === plan.plan?.id}
                >
                  {loadingPlan === plan.plan?.id ? "Loading..." : (
                    <>
                      Start Free Trial
                      {plan.popular && <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </motion.div>

          <div className="text-center mt-14">
            <p className="text-sm text-muted-foreground">
              Need something custom? Contact us for Enterprise pricing.
            </p>
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
