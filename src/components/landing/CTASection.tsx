import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Get Started
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to stop typing and start scaling?
            </h2>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the beta and be the first to experience AI-powered engagement management.
            </p>

            {/* CTA Button */}
            <Button
              size="lg"
              className="group"
              onClick={() => setAuthModal(true)}
            >
              Get Early Access
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
