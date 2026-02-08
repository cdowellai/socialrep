const features = [
  {
    emoji: "🎯",
    title: "Brand Voice Training",
    description:
      "Show the AI how you talk to customers, and it learns your style—friendly, professional, or however you communicate.",
  },
  {
    emoji: "⚡",
    title: "One-Click Responses",
    description:
      "Review what the AI drafts, then send with a single click. Or set rules to auto-reply to common questions.",
  },
  {
    emoji: "📊",
    title: "Sentiment Detection",
    description:
      "Instantly see which comments are positive, negative, or need urgent attention. Catch issues early.",
  },
  {
    emoji: "🛡️",
    title: "Auto-Moderation",
    description:
      "Automatically hide spam, bots, and inappropriate comments so your pages stay clean.",
  },
  {
    emoji: "⭐",
    title: "Review Management",
    description:
      "Respond to reviews on Google, Facebook, Trustpilot, Yelp, and more—all from one place.",
  },
  {
    emoji: "📈",
    title: "Simple Analytics",
    description:
      "Track your response times, see what's working, and understand how engagement is helping your business.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
            <span className="text-sm font-medium text-accent-foreground">
              Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to stay on top of{" "}
            <span className="text-gradient">engagement</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple tools that save you hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{feature.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
