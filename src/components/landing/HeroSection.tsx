import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const handleScrollToDemo = () => {
    const element = document.querySelector("#features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const avatars = [
    { initials: "JR", color: "bg-blue-500" },
    { initials: "KL", color: "bg-emerald-500" },
    { initials: "MT", color: "bg-purple-500" },
    { initials: "SD", color: "bg-orange-500" },
    { initials: "AW", color: "bg-pink-500" },
  ];

  return (
    <>
      <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Now in Open Beta — 14 days free</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Every comment, review, and DM.
              <br />
              <span className="text-gradient">One inbox. One click.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Stop tab-switching between Facebook, Google, Instagram, and Yelp. SocialRep pulls everything into one feed and drafts AI responses that sound like you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-white px-8"
                onClick={() => setAuthModal(true)}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleScrollToDemo}
              >
                See it in action
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex -space-x-2">
                {avatars.map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center text-xs font-medium text-white border-2 border-white`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Joined by 80+ businesses in the beta</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
