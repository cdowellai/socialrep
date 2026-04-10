import { motion } from "framer-motion";
import { Check, Star, RefreshCw } from "lucide-react";

function FeatureBlock({
  reverse,
  label,
  title,
  description,
  bullets,
  children,
}: {
  reverse?: boolean;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
    >
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">{label}</p>
        <h3 className="font-display text-display-sm mb-5">{title}</h3>
        <p className="text-muted-foreground mb-8 leading-relaxed">{description}</p>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-sentiment-positive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-sentiment-positive" />
              </div>
              <span>{b}</span>
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

function ReviewCard({
  name,
  platform,
  stars,
  review,
  response,
}: {
  name: string;
  platform: string;
  stars: number;
  review: string;
  response?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{platform}</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < stars ? "fill-sentiment-neutral text-sentiment-neutral" : "text-muted"}`} />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">"{review}"</p>
      {response ? (
        <div className="border-l-2 border-primary/40 pl-4 bg-accent/30 rounded-r-xl p-4">
          <span className="text-[10px] font-semibold text-primary block mb-1">✦ AI Response — matches your brand voice</span>
          <p className="text-xs leading-relaxed">{response}</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="text-[11px] px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">✦ Generate AI Response</button>
          <button className="text-[11px] px-3.5 py-1.5 rounded-lg border border-border/60 font-medium">View Full Review</button>
        </div>
      )}
    </div>
  );
}

export function FeaturesSection() {
  const chartBars = [
    { h: 65, color: "hsl(var(--platform-facebook))" },
    { h: 80, color: "hsl(var(--platform-instagram))" },
    { h: 50, color: "hsl(var(--platform-google))" },
    { h: 35, color: "hsl(var(--platform-twitter))" },
    { h: 45, color: "hsl(var(--sentiment-negative))" },
    { h: 30, color: "hsl(var(--platform-linkedin))" },
    { h: 70, color: "hsl(var(--platform-facebook))" },
    { h: 85, color: "hsl(var(--platform-instagram))" },
    { h: 55, color: "hsl(var(--platform-google))" },
    { h: 40, color: "hsl(var(--platform-twitter))" },
    { h: 60, color: "hsl(var(--sentiment-negative))" },
    { h: 25, color: "hsl(var(--platform-linkedin))" },
  ];

  return (
    <section id="features" className="py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-5">Features</p>
          <h2 className="font-display text-display-sm md:text-display-md mb-5">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            SocialRep replaces the tools you're duct-taping together — and adds AI that actually does the work.
          </p>
        </motion.div>

        <div className="space-y-28 max-w-6xl mx-auto">
          {/* AI Responses */}
          <FeatureBlock
            label="AI Responses"
            title="AI that writes like you, not like a robot."
            description="Train the AI on your brand voice — your tone, your style, your words. It reads every incoming message and drafts a response that sounds like your best employee wrote it."
            bullets={[
              "Train the AI on your real brand voice with example responses",
              "One-click AI responses to reviews on Google, Yelp, and Facebook",
              "Auto-respond to positive reviews with personalized templates",
              "Every response is a draft until you approve it — you're always in control",
            ]}
          >
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-lg">
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

          {/* Analytics */}
          <FeatureBlock
            reverse
            label="Analytics"
            title="Know what's working. Prove it with data."
            description="Track response times, sentiment trends, and team performance across every platform. Export clean PDF reports when you need to share results."
            bullets={[
              "Response time, sentiment, and interaction volume over time",
              "Team performance tracking — see who's handling what",
              "Platform-by-platform breakdown of every metric",
              "One-click PDF export with clean, professional formatting",
            ]}
          >
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Response Time", value: "1.2h", change: "↓ 74%" },
                  { label: "Response Rate", value: "96%", change: "↑ 12%" },
                  { label: "Avg Sentiment", value: "+0.72", change: "↑ 8%" },
                ].map((m, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl border border-border/40 p-3">
                    <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold font-display">{m.value}</span>
                      <span className="text-[10px] text-sentiment-positive font-medium">{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-muted/20 rounded-xl border border-border/40 p-4">
                <div className="text-xs font-medium mb-3">Interaction Volume</div>
                <div className="flex items-end gap-1.5 h-28">
                  {chartBars.map((bar, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md transition-all"
                      style={{ height: `${bar.h}%`, backgroundColor: bar.color, opacity: 0.85 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FeatureBlock>

          {/* AI Chatbot */}
          <FeatureBlock
            label="AI Chatbot"
            title="An AI chatbot that knows your business."
            description="Add a chatbot to your website that answers customer questions using your own knowledge base. When it can't answer something, it hands off to your team."
            bullets={[
              "Train it on your FAQs, product details, hours, and policies",
              "Branded widget that matches your website's look and feel",
              "Automatic handoff to a human agent when the bot reaches its limit",
              "Capture visitor name and email before the conversation starts",
            ]}
          >
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
              <div className="bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col max-w-sm mx-auto">
                <div className="bg-primary text-primary-foreground px-5 py-4">
                  <div className="text-sm font-semibold">Brew & Co.</div>
                  <div className="text-[10px] opacity-70">Usually replies instantly</div>
                </div>
                <div className="flex-1 p-4 space-y-3 bg-background">
                  <div className="bg-muted/40 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-xs max-w-[85%]">
                    Hi there! 👋 How can we help you today?
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-3.5 py-2.5 text-xs max-w-[85%] ml-auto">
                    Do you have gluten-free options?
                  </div>
                  <div className="bg-muted/40 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-xs max-w-[85%]">
                    Yes! We have 8 gluten-free pastries and all our drinks are naturally GF. Want me to send the full menu?
                  </div>
                </div>
                <div className="px-4 pb-4 bg-background">
                  <div className="border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-muted-foreground">
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
