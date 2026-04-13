import { motion } from "framer-motion";
import { MessageSquareOff, Clock, Copy, type LucideIcon } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const painCards: { icon: LucideIcon; title: string; body: string; stat: string; statLabel: string }[] = [
  {
    icon: MessageSquareOff,
    title: "Messages go unanswered.",
    body: "You're growing — but who has time to respond to every comment, DM, and review across six platforms?",
    stat: "62%",
    statLabel: "of social messages go unanswered",
  },
  {
    icon: Clock,
    title: "Every hour costs you.",
    body: "When someone leaves a review or asks a question, they expect a fast response. Every hour you wait, the chance of winning them drops.",
    stat: "5hrs",
    statLabel: "average first-response time",
  },
  {
    icon: Copy,
    title: "Generic replies fall flat.",
    body: "'Thanks for your feedback!' doesn't cut it. You need responses that sound like they came from someone who actually read the message.",
    stat: "4×",
    statLabel: "more engagement from personalized replies",
  },
];

export function PainPointsSection() {
  return (
    <section className="relative py-28 bg-[#06060a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#818cf8] mb-5">
            The reality
          </p>
          <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white">
            Your customers are talking.
            <br />
            <span className="text-white/50">Are you listening?</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-700"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-[#818cf8]/20 transition-colors duration-500">
                <card.icon className="h-[18px] w-[18px] text-white/50 group-hover:text-[#818cf8]/80 transition-colors duration-500" />
              </div>
              <h3 className="font-bold text-[17px] mb-3 tracking-[-0.01em] text-white">{card.title}</h3>
              <p className="text-[14px] leading-[1.7] text-white/55 flex-1">{card.body}</p>
              <div className="border-t border-white/[0.06] mt-7 pt-5">
                <span className="text-[36px] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">{card.stat}</span>
                <p className="text-[12px] text-white/45 mt-1">{card.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
