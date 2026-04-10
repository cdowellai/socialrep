import { motion } from "framer-motion";

const socialPlatforms = [
  { name: "Facebook", color: "#1877F2" },
  { name: "Instagram", color: "#E4405F" },
  { name: "TikTok", color: "#000000" },
  { name: "YouTube", color: "#FF0000" },
  { name: "LinkedIn", color: "#0A66C2" },
];

const reviewPlatforms = [
  { name: "Google Business", color: "#4285F4" },
  { name: "Trustpilot", color: "#00B67A" },
  { name: "Yelp", color: "#D32323" },
  { name: "BBB", color: "#003DA5" },
  { name: "Facebook Reviews", color: "#1877F2" },
];

function PlatformPill({ name, color }: { name: string; color: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-default">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-28 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">Integrations</p>
          <h2 className="font-display text-display-sm md:text-display-md mb-5">
            Connects to the platforms
            <br />
            you already use.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Monitor and respond to comments, DMs, and reviews across every major platform — from one dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto space-y-10"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4 text-center">Social Platforms</p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((p) => (
                <PlatformPill key={p.name} {...p} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4 text-center">Review Platforms</p>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((p) => (
                <PlatformPill key={p.name} {...p} />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            More integrations available. New platforms added regularly.
          </p>
        </div>
      </div>
    </section>
  );
}
