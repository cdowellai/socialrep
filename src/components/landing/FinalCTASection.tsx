import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-glow opacity-40 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-tag mb-4 inline-block">Get Started</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to stop typing and start scaling?
            </h2>
            <p className="text-lg text-foreground-secondary mb-10 max-w-2xl mx-auto">
              Join the beta and be the first to experience AI-powered engagement
              management.
            </p>

            <Button
              size="lg"
              className="btn-gradient px-10 h-14 text-lg"
              onClick={() => setAuthModal(true)}
            >
              Get Early Access
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        defaultTab="signup"
      />
    </>
  );
}
