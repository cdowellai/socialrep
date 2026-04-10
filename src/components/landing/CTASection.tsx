import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="relative py-32 bg-[#08080d] overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#4338ca]/[0.08] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-6">
              Every unanswered message
              <br />
              is a customer choosing
              <br />
              someone else.
            </h2>
            <p className="text-[16px] text-white/35 mb-10 max-w-lg mx-auto leading-relaxed">
              Connect your accounts, train your AI, and start responding faster — all in the next 15 minutes.
            </p>
            <button
              onClick={() => setAuthModal(true)}
              className="group h-12 px-8 rounded-full bg-white text-[#0a0a0f] font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.3)] inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
