import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Switch } from "@/components/ui/switch";
import { Check, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const planFeatures = {
  starter: [
    { text: "1,000 interactions / month", included: true },
    { text: "3 connected platforms", included: true },
    { text: "AI-powered responses", included: true },
    { text: "Review management", included: true },
    { text: "Email support", included: true },
    { text: "Chatbot widget", included: false },
    { text: "Automations", included: false },
    { text: "Team seats", included: false },
  ],
  professional: [
    { text: "5,000 interactions / month", included: true },
    { text: "7 connected platforms", included: true },
    { text: "Brand voice training", included: true },
    { text: "Chatbot widget", included: true },
    { text: "Automations & leads", included: true },
    { text: "Analytics & PDF reports", included: true },
    { text: "5 team seats", included: true },
    { text: "Priority support", included: true },
  ],
  agency: [
    { text: "Unlimited interactions", included: true },
    { text: "Unlimited platforms", included: true },
    { text: "Custom AI per workspace", included: true },
    { text: "White-label reports", included: true },
    { text: "CRM + API access", included: true },
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
    { name: "Starter", planKey: "starter", monthlyPrice: starterPlan?.monthly_price || 79, annualPrice: starterPlan?.annual_price || 63, description: "For businesses getting started.", features: planFeatures.starter, popular: false, plan: starterPlan },
    { name: "Professional", planKey: "professional", monthlyPrice: professionalPlan?.monthly_price || 199, annualPrice: professionalPlan?.annual_price || 159, description: "For growing businesses that need it all.", features: planFeatures.professional, popular: true, plan: professionalPlan },
    { name: "Agency", planKey: "agency", monthlyPrice: agencyPlan?.monthly_price || 499, annualPrice: agencyPlan?.annual_price || 399, description: "For teams managing multiple clients.", features: planFeatures.agency, popular: false, plan: agencyPlan },
  ];

  return (
    <>
      <section id="pricing" className="py-32 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em] font-extrabold mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-[16px] text-muted-foreground">
              Start with a 14-day free trial on any plan.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-14">
            <span className={`text-[13px] font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-[13px] font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
            {isAnnual && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Save 20%</span>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {displayPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl bg-card border flex flex-col transition-all duration-500 ${
                  plan.popular
                    ? "border-primary/30 shadow-[0_8px_40px_-12px_hsl(234_85%_56%/0.15)] ring-1 ring-primary/10"
                    : "border-border/60 hover:border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold text-[16px] mb-1">{plan.name}</h3>
                  <p className="text-[13px] text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[40px] font-extrabold tracking-[-0.02em]">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="text-muted-foreground text-[14px]">/mo</span>
                  </div>
                  {isAnnual && <p className="text-[11px] text-muted-foreground mt-0.5">billed annually</p>}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                      {feature.included ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="h-2.5 w-2.5 text-muted-foreground/30" />
                        </div>
                      )}
                      <span className={feature.included ? "text-foreground/80" : "text-muted-foreground/40"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full h-10 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => handlePlanSelect(plan.planKey)}
                  disabled={loadingPlan === plan.plan?.id}
                >
                  {loadingPlan === plan.plan?.id ? "Loading..." : (
                    <>
                      Start Free Trial
                      {plan.popular && <ArrowRight className="w-3.5 h-3.5" />}
                    </>
                  )}
                </button>
              </div>
            ))}
          </motion.div>

          <p className="text-center text-[13px] text-muted-foreground/60 mt-12">
            Need something custom? Contact us for Enterprise pricing.
          </p>
        </div>
      </section>

      <AuthModal
        isOpen={authModal}
        onClose={() => { setAuthModal(false); localStorage.removeItem("pending_checkout_plan"); localStorage.removeItem("pending_checkout_period"); }}
        defaultTab="signup"
      />
    </>
  );
}
