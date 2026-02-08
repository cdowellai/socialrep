import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

const agencyFeatures = [
  "Separate workspaces per client",
  "White-label PDF reports with your agency branding",
  "Team roles: Admin, Manager, Agent",
  "SLA monitoring with escalation alerts",
  "API access for custom integrations",
];

const stats = [
  { value: "15", label: "Team seats included" },
  { value: "∞", label: "Connected platforms" },
  { value: "2,000", label: "AI responses/month" },
  { value: "$499", label: "Per month, flat" },
];

export function AgencySection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-[hsl(280,84%,55%)] relative overflow-hidden">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-white/60 mb-3">
                Built for agencies
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6">
                Manage 20 clients from one dashboard. Show them exactly why they pay you.
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Switch between client workspaces in one click. Track SLAs, assign tasks to your team, and generate white-label reports that prove your value every month.
              </p>
              <ul className="space-y-3 mb-8">
                {agencyFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-white shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => setAuthModal(true)}
              >
                See Agency Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Right Column - Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-white/15 rounded-xl p-6 backdrop-blur-sm"
                >
                  <p className="font-display text-4xl md:text-5xl text-white mb-1">{stat.value}</p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
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
