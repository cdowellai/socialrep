import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Check, ArrowRight } from "lucide-react";

export function AgencySection() {
  const [authModal, setAuthModal] = useState(false);

  const features = [
    "Dedicated workspace per client with one-click switching",
    "White-label PDF reports with your agency's branding",
    "Role-based access — Admin, Manager, and Agent permissions",
    "SLA monitoring that escalates before deadlines are missed",
    "Full API access for custom workflows and integrations",
  ];

  const stats = [
    { value: "15", label: "Team seats included" },
    { value: "∞", label: "Connected platforms" },
    { value: "2,000", label: "AI responses per month" },
    { value: "$499", label: "Per month, flat" },
  ];

  return (
    <>
      <section className="py-24 bg-gradient-primary relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-4">
                Built for Agencies
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Your clients ask "what did you do this month?"
                <br />
                Now you'll love that question.
              </h2>
              <p className="text-lg opacity-80 mb-8">
                SocialRep gives agencies a single command center for every client. Separate workspaces, team assignments, SLA tracking, and white-label reports that make your retainer look like a steal.
              </p>
              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => {
                  const el = document.querySelector("#pricing");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See Agency Pricing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Right - Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 text-center text-primary-foreground"
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
