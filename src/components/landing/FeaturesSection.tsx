import { motion } from "framer-motion";
import { Check, Star, RefreshCw, Zap, BarChart3, Bot } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function FeatureBlock({
  reverse,
  icon: Icon,
  label,
  title,
  description,
  bullets,
  children,
}: {
  reverse?: boolean;
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
    >
      <div className={reverse ? "lg:order-2" : ""}>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#818cf8]/[0.08] border border-[#818cf8]/[0.1] mb-6">
          <Icon className="h-3.5 w-3.5 text-[#818cf8]" />
          <span className="text-[11px] font-semibold text-[#818cf8] uppercase tracking-[0.12em]">{label}</span>
        </div>
        <h3 className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-5">{title}</h3>
        <p className="text-[15px] text-white/35 mb-8 leading-[1.7]">{description}</p>
        <ul className="space-y-4">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px]">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-white/50">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        {children}
      </div>
    </motion.div>
  );
}

function ReviewCard({ name, platform, stars, review, response }: {
  name: string; platform: string; stars: number; review: string; response?: string;
}) {
  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-white/80">{name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">{platform}</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < stars ? "fill-amber-400 text-amber-400" : "text-white/10"}`} />
          ))}
        </div>
      </div>
      <p className="text-[12px] text-white/30 leading-relaxed">"{review}"</p>
      {response ? (
        <div className="border-l-2 border-[#818cf8]/30 pl-3 bg-[#818cf8]/[0.03] rounded-r-lg p-3">
          <span className="text-[10px] font-semibold text-[#a78bfa] block mb-1">✦ AI Response</span>
          <p className="text-[12px] leading-relaxed text-white/45">{response}</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="text-[11px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white font-medium shadow-[0_0_12px_-3px_rgba(99,102,241,0.3)]">✦ Generate Response</button>
          <button className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.06] text-white/30 font-medium">View</button>
        </div>
      )}
    </div>
  );
}

export function FeaturesSection() {
  const chartBars = [65, 80, 50, 35, 45, 30, 70, 85, 55, 40, 60, 25];

  return (
    <section id="features" className="relative py-36 bg-[#06060a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#4338ca]/[0.02] rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="text-center max-w-2xl mx-auto mb-28"
        >
          <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-5">
            Everything you need.
            <br />
            <span className="text-white/40">Nothing you don't.</span>
          </h2>
          <p className="text-[16px] text-white/30 max-w-lg mx-auto leading-relaxed">
            Replace the five tools you're duct-taping together with one platform that actually does the work.
          </p>
        </motion.div>

        <div className="space-y-36">
          <FeatureBlock
            icon={Zap}
            label="AI Responses"
            title="AI that writes like you, not like a robot."
            description="Train the AI on your brand voice. It reads every incoming message and drafts responses that sound like your best employee wrote them."
            bullets={[
              "Train with your real brand voice and example responses",
              "One-click AI replies to Google, Yelp, and Facebook reviews",
              "Auto-respond to 5-star reviews with personalized templates",
              "Every response is a draft until you approve — always in control",
            ]}
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-3 shadow-[0_8px_60px_-12px_rgba(99,102,241,0.08)]">
              <ReviewCard
                name="David K."
                platform="Google"
                stars={5}
                review="Best coffee shop in the neighborhood. The oat milk latte is incredible and the staff always remembers my name."
                response="David, that just made our morning! The oat milk latte is a team favorite too. We'll keep your usual ready 😊 — Team Brew & Co."
              />
              <ReviewCard
                name="Lisa M."
                platform="Yelp"
                stars={2}
                review="Waited 25 minutes for a simple order. Staff seemed overwhelmed and my drink was wrong."
              />
            </div>
          </FeatureBlock>

          <FeatureBlock
            reverse
            icon={BarChart3}
            label="Analytics"
            title="Know what's working. Prove it with data."
            description="Track response times, sentiment trends, and team performance. Export professional PDF reports to share with clients or stakeholders."
            bullets={[
              "Response time, sentiment, and interaction volume over time",
              "Team performance tracking for accountability",
              "Platform-by-platform breakdown of every metric",
              "One-click PDF export with professional formatting",
            ]}
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 shadow-[0_8px_60px_-12px_rgba(99,102,241,0.08)]">
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {[
                  { label: "Response Time", value: "1.2h", change: "↓ 74%", good: true },
                  { label: "Response Rate", value: "96%", change: "↑ 12%", good: true },
                  { label: "Sentiment", value: "+0.72", change: "↑ 8%", good: true },
                ].map((m, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-[10px] text-white/25 mb-1">{m.label}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-white/80">{m.value}</span>
                      <span className="text-[10px] font-semibold text-emerald-400">{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <div className="text-[11px] font-medium text-white/25 mb-3">Interaction Volume</div>
                <div className="flex items-end gap-1.5 h-24">
                  {chartBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, rgba(99,102,241,0.3), rgba(139,92,246,0.5))`,
                        opacity: 0.4 + (h / 100) * 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FeatureBlock>

          <FeatureBlock
            icon={Bot}
            label="AI Chatbot"
            title="A chatbot that actually knows your business."
            description="Add a chatbot to your website trained on your knowledge base. When it can't answer, it seamlessly hands off to your team."
            bullets={[
              "Train on your FAQs, product details, hours, and policies",
              "Branded widget matching your website's look and feel",
              "Automatic handoff when the bot reaches its limit",
              "Capture visitor name and email before the conversation",
            ]}
          >
            <div className="flex justify-center">
              <div className="w-80 rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden shadow-[0_8px_60px_-12px_rgba(99,102,241,0.1)]">
                <div className="bg-gradient-to-r from-[#4338ca] to-[#6366f1] px-5 py-4">
                  <div className="text-[14px] font-semibold text-white">Brew & Co.</div>
                  <div className="text-[11px] text-white/50">Usually replies instantly</div>
                </div>
                <div className="p-4 space-y-3 bg-[#0c0c14] min-h-[200px]">
                  <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[12px] max-w-[85%] text-white/45">
                    Hi there! 👋 How can we help you today?
                  </div>
                  <div className="bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white rounded-2xl rounded-tr-md px-3.5 py-2.5 text-[12px] max-w-[85%] ml-auto">
                    Do you have gluten-free options?
                  </div>
                  <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[12px] max-w-[85%] text-white/45">
                    Yes! We have 8 gluten-free pastries and all our drinks are naturally GF. Want me to send the full menu?
                  </div>
                </div>
                <div className="px-4 pb-4 bg-[#0c0c14]">
                  <div className="border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[12px] text-white/15">
                    Type a message...
                  </div>
                </div>
              </div>
            </div>
          </FeatureBlock>
        </div>
      </div>
    </section>
  );
}
