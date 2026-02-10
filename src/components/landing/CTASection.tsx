import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="relative py-24 bg-foreground text-background overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-3xl mx-auto">
            Every unanswered message is a customer choosing someone else.
          </h2>
          <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto">
            Connect your accounts, train your AI, and start responding faster — all in the next 15 minutes.
          </p>
          <div className="flex items-center justify-center">
            <Button variant="hero" size="lg" onClick={() => setAuthModal(true)}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
