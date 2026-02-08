import { Check, Star, Sparkles } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      number: "1",
      title: "Every message, one inbox",
      description: "Comments, DMs, reviews, and mentions from every connected platform — sorted by AI into one prioritized feed. Urgent complaints surface first. Hot leads get flagged. Nothing falls through the cracks.",
      bullets: [
        "Facebook, Instagram, Google, Yelp, and more — all in one stream",
        "AI-powered sentiment detection flags what needs attention now",
        "Assign conversations to team members with internal notes",
        "See the full history of every customer across every platform",
      ],
      visual: "inbox",
    },
    {
      number: "2",
      title: "AI that writes like you, not like a robot",
      description: "SocialRep learns your brand voice from examples you provide — your tone, your style, your words. Every AI-drafted response sounds like it came from your best team member, not a language model. Review before sending, or set rules to auto-respond.",
      bullets: [
        "Train the AI on your actual brand voice and past responses",
        "One-click AI responses to reviews on Google, Yelp, and Facebook",
        "Set rules to auto-respond to 4-5 star reviews with personalized templates",
        "Every response is a draft until you approve it — you're always in control",
      ],
      visual: "ai-responses",
    },
    {
      number: "3",
      title: "Know what's working. Prove it to your clients.",
      description: "Track response times, sentiment trends, review volume, and team performance across every platform. Export polished PDF reports in one click — built for agencies who need to show clients exactly where their money goes.",
      bullets: [
        "Response time, sentiment, and interaction volume trends over time",
        "Team performance leaderboard — see who's handling what",
        "Platform-by-platform breakdown of every metric",
        "One-click PDF export with professional formatting",
      ],
      visual: "analytics",
    },
    {
      number: "4",
      title: "Your smartest employee works 24/7",
      description: "Add an AI chatbot to your website that answers customer questions instantly using your own knowledge base. It learns your FAQs, product details, and policies — and hands off to your team through the Smart Inbox when it can't help.",
      bullets: [
        "Train it on your FAQs, product info, hours, and policies",
        "Fully branded widget that matches your website",
        "Automatic handoff to a human agent when the bot hits its limit",
        "Capture visitor name and email before the conversation starts",
      ],
      visual: "chatbot",
    },
  ];

  const renderVisual = (type: string) => {
    switch (type) {
      case "inbox":
        return (
          <div className="bg-card rounded-xl border border-border p-4 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
              {/* Left - Message List */}
              <div className="space-y-2">
                {[
                  { name: "@sarah_designs", msg: "Love this product! Do you ship to Miami? ✨", tag: "Positive", tagColor: "bg-sentiment-positive", selected: true },
                  { name: "Mike Thompson", msg: "Still waiting on my order...", tag: "Urgent", tagColor: "bg-sentiment-negative", selected: false },
                  { name: "Alex Chen", msg: "Outstanding service!", tag: "★★★★★", tagColor: "bg-sentiment-neutral", selected: false },
                  { name: "Jen Rivera", msg: "Can I get a refund?", tag: "AI Ready", tagColor: "bg-primary", selected: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border text-xs ${
                      item.selected ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-primary/60" />
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    <p className="text-muted-foreground truncate mb-1">{item.msg}</p>
                    <span className={`px-1.5 py-0.5 rounded text-primary-foreground text-[9px] ${item.tagColor}`}>{item.tag}</span>
                  </div>
                ))}
              </div>
              {/* Right - Detail View */}
              <div className="bg-muted/30 rounded-lg p-3 text-xs hidden md:block">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary/60" />
                  <div>
                    <div className="font-medium">@sarah_designs</div>
                    <div className="text-muted-foreground text-[10px]">Instagram</div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">Love this product! Do you ship to Miami? ✨</p>
                <div className="border border-dashed border-primary/50 rounded-lg p-2 bg-primary/5 mb-2">
                  <div className="flex items-center gap-1 text-primary mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium text-[10px]">AI Draft</span>
                  </div>
                  <p className="text-[10px]">Hi Sarah! Thank you so much! 💛 Yes, we ship to Miami — usually 3-5 business days. Want me to send you a direct link?</p>
                </div>
                <div className="flex gap-1">
                  <button className="flex-1 bg-primary text-primary-foreground rounded px-2 py-1 text-[10px]">Send Response</button>
                  <button className="px-2 py-1 border border-border rounded text-[10px]">Edit</button>
                </div>
              </div>
            </div>
          </div>
        );
      case "ai-responses":
        return (
          <div className="space-y-3">
            {/* Review 1 - Positive */}
            <div className="bg-card rounded-xl border border-border p-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/60" />
                <span className="font-medium">David K.</span>
                <span className="text-muted-foreground">• Google</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-sentiment-neutral text-sentiment-neutral" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3">Best coffee shop in the neighborhood. The oat milk latte is incredible and the staff always remembers my name.</p>
              <div className="border-l-2 border-primary pl-3 bg-primary/5 rounded-r-lg p-2">
                <div className="flex items-center gap-1 text-primary mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-medium text-[10px]">AI Response — matches your brand voice</span>
                </div>
                <p className="text-[10px]">David, that just made our morning! The oat milk latte is a team favorite too. We'll keep your usual ready 😊 — Team Brew & Co.</p>
              </div>
            </div>
            {/* Review 2 - Negative */}
            <div className="bg-card rounded-xl border border-border p-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-accent" />
                <span className="font-medium">Lisa M.</span>
                <span className="text-muted-foreground">• Yelp</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-sentiment-neutral text-sentiment-neutral" />
                ))}
                {[3,4,5].map((i) => (
                  <Star key={i} className="w-3 h-3 text-muted-foreground" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3">Waited 25 minutes for a simple order. Staff seemed overwhelmed and my drink was wrong.</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[10px]">
                  <Sparkles className="w-3 h-3" />
                  Generate AI Response
                </button>
                <button className="px-2 py-1 border border-border rounded text-[10px]">View Full Review</button>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="bg-card rounded-xl border border-border p-4">
            {/* Metric Cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Response Time", value: "1.2h", change: "↓ 74%", positive: true },
                { label: "Response Rate", value: "96%", change: "↑ 12%", positive: true },
                { label: "Avg Sentiment", value: "+0.72", change: "↑ 8%", positive: true },
              ].map((m, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                  <div className="font-bold text-sm">{m.value}</div>
                  <div className={`text-[10px] ${m.positive ? "text-sentiment-positive" : "text-sentiment-negative"}`}>{m.change}</div>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="text-xs text-muted-foreground mb-2">Interaction Volume by Platform</div>
            <div className="flex items-end gap-1 h-20">
              {[70, 55, 85, 40, 30, 45, 75, 60, 80, 35, 25, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        );
      case "chatbot":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Config Panel */}
            <div className="bg-card rounded-xl border border-border p-3 text-xs space-y-2">
              <div>
                <div className="text-muted-foreground mb-1">Widget Title</div>
                <div className="bg-muted/30 rounded px-2 py-1">Chat with Brew & Co.</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Welcome Message</div>
                <div className="bg-muted/30 rounded px-2 py-1">Hi there! 👋 How can we help?</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Brand Color</div>
                <div className="flex gap-1">
                  {["bg-primary", "bg-platform-facebook", "bg-sentiment-positive", "bg-accent", "bg-sentiment-neutral"].map((c, i) => (
                    <div key={i} className={`w-5 h-5 rounded ${c} ${i === 0 ? "ring-2 ring-offset-1 ring-primary" : ""}`} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Knowledge Base</div>
                <div className="bg-muted/30 rounded px-2 py-1 flex items-center gap-1">
                  <Check className="w-3 h-3 text-sentiment-positive" />
                  24 FAQs loaded
                </div>
              </div>
            </div>
            {/* Chat Widget */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-primary text-primary-foreground px-3 py-2 text-xs">
                <div className="font-medium">Brew & Co.</div>
                <div className="text-[10px] opacity-80">Usually replies instantly</div>
              </div>
              <div className="p-2 space-y-2 text-[10px]">
                <div className="bg-muted rounded-lg px-2 py-1 max-w-[80%]">Hi there! 👋 How can we help you today?</div>
                <div className="bg-primary text-primary-foreground rounded-lg px-2 py-1 max-w-[80%] ml-auto">Do you have gluten-free options?</div>
                <div className="bg-muted rounded-lg px-2 py-1 max-w-[80%]">Yes! We have 8 gluten-free pastries and all our drinks are naturally GF. Want me to send the full menu?</div>
              </div>
              <div className="border-t border-border px-2 py-1">
                <div className="bg-muted/50 rounded px-2 py-1 text-[10px] text-muted-foreground">Type a message...</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            The SocialRep Platform
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            One platform. Every conversation.
            <br />
            <span className="text-gradient">AI that actually helps.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to monitor, respond, and grow your online reputation — without hiring another person.
          </p>
        </div>

        {/* Feature Rows */}
        <div className="space-y-24 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Content */}
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {feature.number}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-sentiment-positive mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual */}
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                {renderVisual(feature.visual)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
