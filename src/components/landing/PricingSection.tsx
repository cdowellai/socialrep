import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out SocialRep",
    features: [
      "100 interactions/month",
      "2 connected platforms",
      "Basic AI responses",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small businesses getting started",
    features: [
      "1,000 interactions/month",
      "5 connected platforms",
      "Advanced AI with brand voice",
      "Review management",
      "Basic analytics",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "For growing businesses",
    features: [
      "5,000 interactions/month",
      "15 connected platforms",
      "Custom AI training",
      "Lead generation",
      "Advanced analytics & reports",
      "Team collaboration (3 seats)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/month",
    description: "For large organizations",
    features: [
      "Unlimited interactions",
      "Unlimited platforms",
      "Custom AI models",
      "CRM integrations",
      "White-label options",
      "Unlimited team seats",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-tag mb-4 inline-block">Pricing</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Simple, transparent{" "}
              <span className="text-gradient-accent">pricing</span>
            </h2>
            <p className="text-lg text-foreground-secondary">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-xl bg-background-secondary border ${
                  plan.popular
                    ? "border-accent shadow-glow"
                    : "border-border"
                } flex flex-col animate-fade-in-up hover:border-accent/50 transition-colors`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-accent text-background text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono">{plan.price}</span>
                    <span className="text-foreground-muted">{plan.period}</span>
                  </div>
                  <p className="text-sm text-foreground-muted mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <span className="text-foreground-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={plan.popular ? "btn-gradient w-full" : "w-full border-border hover:bg-background-tertiary"}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => setAuthModal(true)}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
