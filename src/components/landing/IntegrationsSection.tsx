import { motion } from "framer-motion";

const platforms = [
  { name: "Facebook", color: "#1877F2" },
  { name: "Instagram", color: "#E4405F" },
  { name: "Google Business", color: "#4285F4" },
  { name: "Trustpilot", color: "#00B67A" },
  { name: "Yelp", color: "#D32323" },
  { name: "TikTok", color: "#000000" },
  { name: "YouTube", color: "#FF0000" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "BBB", color: "#003DA5" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary/80 mb-4">Integrations</p>
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em] font-extrabold mb-5">
            Every platform.
            <br />
            One dashboard.
          </h2>
          <p className="text-[16px] text-muted-foreground leading-relaxed">
            Monitor and respond across social media and review sites without switching tabs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
        >
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-card border border-border/60 hover:border-primary/20 hover:shadow-[0_4px_20px_-6px_hsl(234_85%_56%/0.08)] transition-all duration-400 cursor-default"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[13px] font-medium">{p.name}</span>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-[13px] text-muted-foreground/60 mt-10">
          New platforms added regularly.
        </p>
      </div>
    </section>
  );
}
