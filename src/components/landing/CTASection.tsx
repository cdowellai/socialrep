import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="py-24 relative overflow-hidden bg-foreground">
        {/* Subtle radial glow from bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6">
              Every unanswered message is a customer choosing someone else.
            </h2>

            <p className="text-lg text-background/70 mb-10 max-w-2xl mx-auto">
              Connect your accounts, train your AI, and start responding 10x faster — all in the next 15 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
                onClick={() => setAuthModal(true)}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-background/30 text-background hover:bg-background/10"
              >
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
