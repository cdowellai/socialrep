import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="relative py-32 bg-foreground text-background overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-display-sm md:text-display-md lg:text-display-lg mb-7 max-w-3xl mx-auto">
              Every unanswered message is a customer choosing someone else.
            </h2>
            <p className="text-lg opacity-60 mb-12 max-w-xl mx-auto leading-relaxed">
              Connect your accounts, train your AI, and start responding faster — all in the next 15 minutes.
            </p>
            <Button
              variant="hero"
              size="xl"
              onClick={() => setAuthModal(true)}
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
