import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight, Play } from "lucide-react";

export function NewHeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const stats = [
    { value: "93%", label: "Response time reduction" },
    { value: "40hrs", label: "Saved per month" },
    { value: "100k+", label: "Responses automated" },
  ];

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-16 bg-hero-pattern overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-background-secondary border border-border mb-8 animate-fade-in-up">
              <span className="pulse-dot-green pl-3" />
              <span className="text-sm text-foreground-secondary">
                Now in Beta — Join the waitlist
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up delay-100">
              Stop drowning in comments.
              <br />
              <span className="text-gradient-accent">Let AI respond.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
              One platform to manage and respond to every comment, message, and
              review across all your channels—powered by AI that sounds like you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
              <Button
                size="lg"
                className="btn-gradient px-8 h-12 text-base"
                onClick={() => setAuthModal(true)}
              >
                Get Early Access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-12 text-base border-border hover:bg-background-secondary"
              >
                <Play className="h-4 w-4 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Stats Row */}
            <div className="border-t border-border pt-10 animate-fade-in-up delay-400">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold font-mono text-accent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-foreground-muted">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        defaultTab="signup"
      />
    </>
  );
}
