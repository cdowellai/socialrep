import { Check, Star, RefreshCw } from "lucide-react";

function FeatureRow({
  reverse,
  title,
  description,
  bullets,
  children,
}: {
  reverse?: boolean;
  title: string;
  description: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className={reverse ? "lg:order-2" : ""}>
        <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-sentiment-positive mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        {children}
      </div>
    </div>
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
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
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
        <div className="border-l-2 border-primary pl-3 bg-accent/30 rounded-r-md p-3">
          <span className="text-[10px] font-semibold text-primary block mb-1">✦ AI Response — matches your brand voice</span>
          <p className="text-xs leading-relaxed">{response}</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="text-[11px] px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium">✦ Generate AI Response</button>
          <button className="text-[11px] px-3 py-1.5 rounded-md border border-border font-medium">View Full Review</button>
        </div>
      )}
    </div>
  );
}

export function FeaturesSection() {
  const chartBars = [
    { h: 65, color: "hsl(221, 44%, 41%)" },
    { h: 80, color: "hsl(330, 72%, 52%)" },
    { h: 50, color: "hsl(12, 83%, 55%)" },
    { h: 35, color: "hsl(203, 89%, 53%)" },
    { h: 45, color: "hsl(0, 84%, 60%)" },
    { h: 30, color: "hsl(201, 100%, 35%)" },
    { h: 70, color: "hsl(221, 44%, 41%)" },
    { h: 85, color: "hsl(330, 72%, 52%)" },
    { h: 55, color: "hsl(12, 83%, 55%)" },
    { h: 40, color: "hsl(203, 89%, 53%)" },
    { h: 60, color: "hsl(0, 84%, 60%)" },
    { h: 25, color: "hsl(201, 100%, 35%)" },
  ];

  const colorSwatches = [
    "hsl(238, 84%, 67%)",
    "hsl(152, 76%, 43%)",
    "hsl(330, 72%, 52%)",
    "hsl(38, 92%, 50%)",
    "hsl(203, 89%, 53%)",
  ];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-lg text-muted-foreground">
            SocialRep replaces the 5 tools you're duct-taping together — and adds AI that actually does the work.
          </p>
        </div>

        <div className="space-y-24 max-w-6xl mx-auto">
          {/* Feature 1: AI Responses */}
          <FeatureRow
            title="AI that writes like you, not like a robot"
            description="This is what makes SocialRep different. You teach the AI your brand voice — your tone, your style, your words. It reads every incoming message and drafts a response that sounds like your best employee wrote it. You approve and send, or set rules to handle the easy ones automatically."
            bullets={[
              "Train the AI on your real brand voice with example responses",
              "One-click AI responses to reviews on Google, Yelp, and Facebook",
              "Auto-respond to positive reviews with personalized templates",
              "Every response is a draft until you approve it — you're always in control",
            ]}
          >
            <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
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
          </FeatureRow>

          {/* Feature 2: Analytics */}
          <FeatureRow
            reverse
            title="Know what's working. Prove it with data."
            description="Track response times, sentiment trends, review volume, and team performance across every platform. Export clean PDF reports in one click — whether you're reporting to yourself, your boss, or your clients."
            bullets={[
              "Response time, sentiment, and interaction volume over time",
              "Team performance tracking — see who's handling what",
              "Platform-by-platform breakdown of every metric",
              "One-click PDF export with clean, professional formatting",
            ]}
          >
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Response Time", value: "1.2h", change: "↓ 74%" },
                  { label: "Response Rate", value: "96%", change: "↑ 12%" },
                  { label: "Avg Sentiment", value: "+0.72", change: "↑ 8%" },
                ].map((m, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border p-3">
                    <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold">{m.value}</span>
                      <span className="text-[10px] text-sentiment-positive">{m.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="text-xs font-medium mb-3">Interaction Volume by Platform</div>
                <div className="flex items-end gap-1.5 h-28">
                  {chartBars.map((bar, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{ height: `${bar.h}%`, backgroundColor: bar.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FeatureRow>

          {/* Feature 3: AI Chatbot */}
          <FeatureRow
            title="An AI chatbot that knows your business"
            description="Add a chatbot to your website that answers customer questions using your own knowledge base — your FAQs, your product info, your policies. When it can't answer something, it hands off to your team through the Smart Inbox."
            bullets={[
              "Train it on your FAQs, product details, hours, and policies",
              "Branded widget that matches your website's look and feel",
              "Automatic handoff to a human agent when the bot reaches its limit",
              "Capture visitor name and email before the conversation starts",
            ]}
          >
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Config Panel */}
                <div className="space-y-3">
                  {[
                    { label: "Widget Title", value: "Chat with Brew & Co." },
                    { label: "Welcome Message", value: "Hi there! 👋 How can we help?" },
                  ].map((field, i) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-3">
                      <div className="text-[10px] text-muted-foreground mb-1">{field.label}</div>
                      <div className="text-xs font-medium">{field.value}</div>
                    </div>
                  ))}
                  <div className="bg-card rounded-lg border border-border p-3">
                    <div className="text-[10px] text-muted-foreground mb-1.5">Brand Color</div>
                    <div className="flex gap-2">
                      {colorSwatches.map((c, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full ${i === 0 ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-card rounded-lg border border-border p-3">
                    <div className="text-[10px] text-muted-foreground mb-1">Knowledge Base</div>
                    <div className="text-xs font-medium text-sentiment-positive">✓ 24 FAQs loaded</div>
                  </div>
                </div>

                {/* Chat Widget */}
                <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                  <div className="bg-primary text-primary-foreground px-4 py-3">
                    <div className="text-sm font-semibold">Brew & Co.</div>
                    <div className="text-[10px] opacity-80">Usually replies instantly</div>
                  </div>
                  <div className="flex-1 p-3 space-y-2">
                    <div className="bg-accent rounded-lg rounded-tl-none px-3 py-2 text-xs max-w-[85%]">
                      Hi there! 👋 How can we help you today?
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none px-3 py-2 text-xs max-w-[85%] ml-auto">
                      Do you have gluten-free options?
                    </div>
                    <div className="bg-accent rounded-lg rounded-tl-none px-3 py-2 text-xs max-w-[85%]">
                      Yes! We have 8 gluten-free pastries and all our drinks are naturally GF. Want me to send the full menu?
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
                      Type a message...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FeatureRow>
        </div>
      </div>
    </section>
  );
}
