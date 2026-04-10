import { motion } from "framer-motion";
import { MessageSquareOff, Clock, Copy, type LucideIcon } from "lucide-react";

const painCards: { icon: LucideIcon; title: string; body: string; stat: string }[] = [
  {
    icon: MessageSquareOff,
    title: "Comments pile up. Customers move on.",
    body: "You're getting traction — but who has time to respond to every comment, DM, and review across 6 platforms? Every one you miss is a customer who stops waiting.",
    stat: "The average business misses 62% of social messages",
  },
  {
    icon: Clock,
    title: "Slow replies cost you real money.",
    body: "When someone leaves a review or asks a question, they expect a fast response. Every hour you wait, the chance of winning them back drops.",
    stat: "Customers expect a response within hours, not days",
  },
  {
    icon: Copy,
    title: "Generic responses do more harm than good.",
    body: "Customers can spot a template from a mile away. 'Thanks for your feedback!' doesn't cut it. You need responses that sound like they came from a human who read the message.",
    stat: "Personalized responses get 4× more engagement",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function PainPointsSection() {
  return (
    <section className="relative py-28 bg-foreground text-background overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">
            Sound Familiar?
          </p>
          <h2 className="font-display text-display-sm md:text-display-md">
            You're growing your business.
            <br />
            Your inbox is growing faster.
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              variants={item}
              className="rounded-2xl border border-background/[0.08] bg-background/[0.03] p-7 flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">{card.title}</h3>
              <p className="text-sm leading-relaxed opacity-70 flex-1">{card.body}</p>
              <div className="border-t border-background/[0.08] mt-6 pt-4">
                <p className="text-xs font-medium text-primary/90">{card.stat}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
