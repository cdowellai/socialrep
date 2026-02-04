import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const stats = [
    { value: "93%", label: "Response time reduction" },
    { value: "10hrs", label: "Saved per week" },
    { value: "50k+", label: "Responses automated" },
  ];

  const scrollToPricing = () => {
    const element = document.querySelector("#pricing");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in tracking-tight">
              Stop drowning in comments.
              <br />
              <span className="text-primary">Let AI respond.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              One platform to manage and respond to comments, messages, and reviews across all your channels—powered by AI that sounds like you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="text-base px-8" onClick={() => setAuthModal(true)}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8" onClick={scrollToPricing}>
                See Plans
              </Button>
            </div>

            {/* Stats */}
            <div className="border-t border-border pt-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
