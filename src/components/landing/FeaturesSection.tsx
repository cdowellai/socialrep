import { motion } from "framer-motion";
import { Check, Star, RefreshCw, Zap, BarChart3, Bot, Shield, TrendingUp } from "lucide-react";

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
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#818cf8]/80 mb-6">{label}</p>
        <h3 className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white mb-5">{title}</h3>
        <p className="text-[15px] text-white/55 mb-8 leading-[1.7]">{description}</p>
        <ul className="space-y-4">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px]">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span className="text-white/65">{b}</span>
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

/* ─── Premium Review Card ─── */
function ReviewCard({ name, platform, stars, review, response, avatar }: {
  name: string; platform: string; stars: number; review: string; response?: string; avatar: string;
}) {
  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-5 space-y-3.5 hover:border-white/[0.09] transition-colors duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[12px] font-bold text-white/70 ring-1 ring-white/10">{avatar}</div>
          <div>
            <span className="text-[13px] font-semibold text-white/85">{name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.05]">{platform}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? "fill-amber-400 text-amber-400" : "text-white/15"}`} />
          ))}
        </div>
      </div>
      <p className="text-[13px] text-white/50 leading-relaxed italic">"{review}"</p>
      {response ? (
        <div className="border-l-2 border-[#818cf8]/30 pl-4 bg-gradient-to-r from-[#818cf8]/[0.04] to-transparent rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#818cf8] to-[#a78bfa] flex items-center justify-center shadow-[0_0_10px_-2px_rgba(129,140,248,0.3)]">
              <span className="text-[7px] text-white font-bold">✦</span>
            </div>
            <span className="text-[10px] font-semibold text-[#a78bfa]">AI Response</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ml-auto">Sent</span>
          </div>
          <p className="text-[12px] leading-[1.7] text-white/55">{response}</p>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          <button className="text-[11px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white font-semibold shadow-[0_0_16px_-4px_rgba(99,102,241,0.4)] flex items-center gap-1.5">
            <span className="text-[9px]">✦</span> Generate Response
          </button>
          <button className="text-[11px] px-3.5 py-2 rounded-xl border border-white/[0.06] text-white/40 font-medium">View Thread</button>
        </div>
      )}
    </div>
  );
}

export function FeaturesSection() {
  const chartBars = [35, 45, 55, 50, 62, 58, 70, 68, 75, 80, 78, 88];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <section id="features" className="relative py-40 bg-[#06060a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
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
            Built for the conversations
            <br />
            <span className="text-white/50">that matter.</span>
          </h2>
          <p className="text-[16px] text-white/50 max-w-lg mx-auto leading-relaxed">
            One platform that replaces the five tools you're duct-taping together.
          </p>
        </motion.div>

        <div className="space-y-40">
          {/* Feature 1: AI Responses */}
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
            <div className="relative">
              <div className="absolute -inset-4 bg-[#818cf8]/[0.03] rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0c14] p-5 space-y-3 shadow-[0_20px_80px_-20px_rgba(99,102,241,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <ReviewCard
                  name="David K."
                  platform="Google"
                  stars={5}
                  review="Best coffee shop in the neighborhood. The oat milk latte is incredible and the staff always remembers my name."
                  response="David, that just made our morning! The oat milk latte is a team favorite too. We'll keep your usual ready 😊 — Team Brew & Co."
                  avatar="DK"
                />
                <ReviewCard
                  name="Lisa M."
                  platform="Yelp"
                  stars={2}
                  review="Waited 25 minutes for a simple order. Staff seemed overwhelmed and my drink was wrong."
                  avatar="LM"
                />
              </div>
            </div>
          </FeatureBlock>

          {/* Feature 2: Analytics */}
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
            <div className="relative">
              <div className="absolute -inset-4 bg-[#818cf8]/[0.03] rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative rounded-2xl border border-white/[0.06] bg-[#0c0c14] p-6 shadow-[0_20px_80px_-20px_rgba(99,102,241,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Response Time", value: "1.2h", change: "↓ 74%", icon: TrendingUp },
                    { label: "Response Rate", value: "96%", change: "↑ 12%", icon: Shield },
                    { label: "Sentiment", value: "+0.72", change: "↑ 8%", icon: Star },
                  ].map((m, i) => (
                    <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] group hover:border-white/[0.08] transition-colors duration-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-white/40 font-medium">{m.label}</div>
                        <m.icon className="h-3 w-3 text-white/15" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white/85">{m.value}</span>
                        <span className="text-[10px] font-semibold text-emerald-400">{m.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/[0.015] rounded-xl p-5 border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[12px] font-semibold text-white/50">Interaction Volume</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/35">Last 12 months</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 h-28">
                    {chartBars.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className="w-full rounded-t-md transition-all duration-700 hover:opacity-100"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, rgba(67,56,202,0.4), rgba(129,140,248,0.6))`,
                            opacity: 0.5 + (h / 100) * 0.5,
                          }}
                        />
                        <span className="text-[7px] text-white/25">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FeatureBlock>

          {/* Feature 3: AI Chatbot */}
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
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-[#818cf8]/[0.02] rounded-3xl blur-3xl pointer-events-none" />
              <div className="relative w-[340px] rounded-2xl border border-white/[0.06] bg-[#0c0c14] overflow-hidden shadow-[0_20px_80px_-20px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="bg-gradient-to-r from-[#4338ca] to-[#6366f1] px-5 py-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-[12px] font-bold backdrop-blur-sm">B</div>
                    <div>
                      <div className="text-[14px] font-semibold text-white">Brew & Co.</div>
                      <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Usually replies instantly
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 bg-[#0c0c14] min-h-[220px]">
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#4338ca]/30 flex-shrink-0 flex items-center justify-center text-[8px] text-white/60 font-bold">B</div>
                    <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-4 py-2.5 text-[12px] max-w-[80%] text-white/55 leading-relaxed border border-white/[0.03]">
                      Hi there! 👋 How can we help you today?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-[12px] max-w-[80%] shadow-[0_4px_16px_-4px_rgba(99,102,241,0.3)]">
                      Do you have gluten-free options?
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#4338ca]/30 flex-shrink-0 flex items-center justify-center text-[8px] text-white/60 font-bold">B</div>
                    <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-4 py-2.5 text-[12px] max-w-[80%] text-white/55 leading-relaxed border border-white/[0.03]">
                      Yes! We have 8 gluten-free pastries and all our drinks are naturally GF. Want me to send the full menu? 🍰
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 bg-[#0c0c14]">
                  <div className="border border-white/[0.06] rounded-xl px-4 py-3 text-[12px] text-white/25 flex items-center justify-between">
                    <span>Type a message...</span>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4338ca] to-[#6366f1] flex items-center justify-center opacity-40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </div>
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
