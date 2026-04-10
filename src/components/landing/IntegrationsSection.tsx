import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const platforms = [
  { name: "Facebook", color: "#1877F2" },
  { name: "Instagram", color: "#E4405F" },
  { name: "Google Business", color: "#4285F4" },
  { name: "Trustpilot", color: "#00B67A" },
  { name: "Yelp", color: "#D32323" },
  { name: "TikTok", color: "#ffffff" },
  { name: "YouTube", color: "#FF0000" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "BBB", color: "#003DA5" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="relative py-36 bg-[#06060a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#818cf8]/60 mb-5">Integrations</p>
          <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-5">
            Every platform.
            <br />
            <span className="text-white/40">One dashboard.</span>
          </h2>
          <p className="text-[16px] text-white/30 leading-relaxed">
            Monitor and respond across social media and review sites without switching tabs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
        >
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
              className="group inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-default"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_-1px_currentColor] transition-shadow duration-500 group-hover:shadow-[0_0_14px_-1px_currentColor]"
                style={{ backgroundColor: p.color, color: p.color }}
              />
              <span className="text-[13px] font-medium text-white/60 group-hover:text-white/80 transition-colors duration-500">{p.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-[12px] text-white/15 mt-12">
          New platforms added regularly
        </p>
      </div>
    </section>
  );
}
