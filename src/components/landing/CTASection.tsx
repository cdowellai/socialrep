import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="py-24 bg-foreground relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6">
              Your competitors are already responding faster than you
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Every day without a system is another missed review, another lost customer, another unanswered DM. Start your free trial and see the difference in 15 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                className="border-white/20 text-white hover:bg-white/10"
              >
                Talk to our team
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
