import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/AuthModal";
import { Switch } from "@/components/ui/switch";
import { Check, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const ease = [0.16, 1, 0.3, 1] as const;

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
      <section id="pricing" className="relative py-36 bg-[#06060a] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        {/* Ambient behind popular card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[600px] bg-[#4338ca]/[0.03] blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease }}
            className="text-center mb-12"
          >
            <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-[16px] text-white/50">
              Start with a 14-day free trial on any plan.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-16">
            <span className={`text-[13px] font-medium transition-colors duration-300 ${!isAnnual ? "text-white" : "text-white/40"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-[13px] font-medium transition-colors duration-300 ${isAnnual ? "text-white" : "text-white/40"}`}>Annual</span>
            {isAnnual && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Save 20%</span>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, ease }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {displayPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-7 rounded-2xl flex flex-col transition-all duration-700 ${
                  plan.popular
                    ? "bg-white/[0.04] border border-[#818cf8]/20 shadow-[0_16px_80px_-20px_rgba(99,102,241,0.15)] ring-1 ring-[#818cf8]/10"
                    : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white text-[11px] font-semibold shadow-[0_0_20px_-4px_rgba(99,102,241,0.4)]">
                    Most popular
                  </div>
                )}

                <div className="mb-7">
                  <h3 className="font-bold text-[16px] mb-1 text-white">{plan.name}</h3>
                  <p className="text-[13px] text-white/45 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[44px] font-extrabold tracking-[-0.03em] text-white">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="text-white/40 text-[14px] font-medium">/mo</span>
                  </div>
                  {isAnnual && <p className="text-[11px] text-white/35 mt-1">billed annually</p>}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                      {feature.included ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="h-2.5 w-2.5 text-white/25" />
                        </div>
                      )}
                      <span className={feature.included ? "text-white/65" : "text-white/30"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full h-11 rounded-xl text-[13px] font-semibold transition-all duration-500 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-white text-[#06060a] hover:bg-white/90 shadow-[0_0_30px_-6px_rgba(255,255,255,0.15)]"
                      : "bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white/90 border border-white/[0.06]"
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

          <p className="text-center text-[12px] text-white/35 mt-14">
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