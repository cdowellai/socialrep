import { motion } from "framer-motion";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";
import { type ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

function Monogram({ letter, color }: { letter: string; color: string }) {
  return (
    <span className="text-[13px] font-extrabold leading-none" style={{ color }}>{letter}</span>
  );
}

const platforms: { name: string; color: string; icon: ReactNode }[] = [
  { name: "Facebook", color: "#1877F2", icon: <Facebook className="h-4 w-4" style={{ color: "#1877F2" }} /> },
  { name: "Instagram", color: "#E4405F", icon: <Instagram className="h-4 w-4" style={{ color: "#E4405F" }} /> },
  { name: "Google Business", color: "#4285F4", icon: <Monogram letter="G" color="#4285F4" /> },
  { name: "Trustpilot", color: "#00B67A", icon: <Monogram letter="T" color="#00B67A" /> },
  { name: "Yelp", color: "#D32323", icon: <Monogram letter="Y" color="#D32323" /> },
  { name: "TikTok", color: "#ffffff", icon: <MessageCircle className="h-4 w-4" style={{ color: "#ffffff" }} /> },
  { name: "YouTube", color: "#FF0000", icon: <Youtube className="h-4 w-4" style={{ color: "#FF0000" }} /> },
  { name: "LinkedIn", color: "#0A66C2", icon: <Linkedin className="h-4 w-4" style={{ color: "#0A66C2" }} /> },
  { name: "BBB", color: "#003DA5", icon: <Monogram letter="B" color="#003DA5" /> },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="relative py-28 bg-[#06060a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#818cf8] mb-5">Integrations</p>
          <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-5">
            Every platform.
            <br />
            <span className="text-white/50">One dashboard.</span>
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed">
            Monitor and respond across social media and review sites without switching tabs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
        >
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
              className="group inline-flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-default"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500"
                style={{ backgroundColor: `${p.color}15` }}
              >
                {p.icon}
              </div>
              <span className="text-[14px] font-medium text-white/70 group-hover:text-white/90 transition-colors duration-500">{p.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-[13px] text-white/40 mt-14">
          New platforms added regularly
        </p>
      </div>
    </section>
  );
}
