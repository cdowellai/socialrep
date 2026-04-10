import { motion } from "framer-motion";
import { MessageSquareOff, Clock, Copy, type LucideIcon } from "lucide-react";

const painCards: { icon: LucideIcon; title: string; body: string; stat: string }[] = [
  {
    icon: MessageSquareOff,
    title: "Comments pile up. Customers move on.",
    body: "You're getting traction — but who has time to respond to every comment, DM, and review across 6 platforms? Every one you miss is a customer who stops waiting.",
    stat: "62% of social messages go unanswered",
  },
  {
    icon: Clock,
    title: "Slow replies cost you real money.",
    body: "When someone leaves a review or asks a question, they expect a fast response. Every hour you wait, the chance of winning them back drops.",
    stat: "Customers expect a response in hours, not days",
  },
  {
    icon: Copy,
    title: "Generic responses do more harm than good.",
    body: "'Thanks for your feedback!' doesn't cut it. You need responses that sound like they came from a human who actually read the message.",
    stat: "Personalized responses get 4× more engagement",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-primary/80 mb-4">
            Sound familiar?
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em] font-extrabold">
            You're growing your business.
            <br />
            Your inbox is growing faster.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-2xl border border-border/80 bg-card p-7 flex flex-col hover:border-primary/20 hover:shadow-[0_8px_40px_-12px_hsl(234_85%_56%/0.08)] transition-all duration-500"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                <card.icon className="h-[18px] w-[18px] text-primary/70" />
              </div>
              <h3 className="font-bold text-[17px] mb-3 tracking-[-0.01em]">{card.title}</h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground flex-1">{card.body}</p>
              <div className="border-t border-border/60 mt-6 pt-4">
                <p className="text-[13px] font-medium text-primary/70">{card.stat}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
