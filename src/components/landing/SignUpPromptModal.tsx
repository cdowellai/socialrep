import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useEffect } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

interface SignUpPromptModalProps {
  open: boolean;
  feature: string | null;
  onClose: () => void;
}

export function SignUpPromptModal({ open, feature, onClose }: SignUpPromptModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleScrollToPricing = () => {
    onClose();
    setTimeout(() => {
      document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.5, ease }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#14141d] to-[#0c0c14] p-8 shadow-[0_40px_120px_-20px_rgba(67,56,202,0.4),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            {/* Glow */}
            <div className="absolute -inset-px bg-gradient-to-b from-[#818cf8]/10 via-transparent to-transparent rounded-2xl pointer-events-none" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="relative mb-5 flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center shadow-[0_0_40px_-4px_rgba(124,58,237,0.6)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Copy */}
            <div className="relative text-center mb-7">
              <h3 className="text-[24px] font-extrabold tracking-[-0.02em] text-white mb-2.5">
                Want to explore{" "}
                <span className="bg-gradient-to-r from-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
                  {feature ?? "this"}
                </span>
                ?
              </h3>
              <p className="text-white/55 text-[14px] leading-[1.6] font-light max-w-[320px] mx-auto">
                Start your free trial to unlock the full SocialRep platform — leads, analytics, automations, and more.
              </p>
            </div>

            {/* CTAs */}
            <div className="relative flex flex-col gap-2.5">
              <button
                onClick={handleScrollToPricing}
                className="group h-[46px] w-full rounded-full bg-white text-[#06060a] font-semibold text-[14px] hover:bg-white/95 transition-all duration-400 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={handleScrollToPricing}
                className="h-[42px] w-full rounded-full text-white/55 hover:text-white/85 font-medium text-[13px] transition-colors duration-300"
              >
                See pricing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
