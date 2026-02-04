import { Target, Zap, BarChart3, Shield, Star, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    emoji: "🎯",
    title: "Brand Voice Training",
    description:
      "Show the AI how you talk to customers, and it learns your style—friendly, professional, or however you communicate.",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "One-Click Responses",
    description:
      "Review what the AI drafts, then send with a single click. Or set rules to auto-reply to common questions.",
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Sentiment Detection",
    description:
      "Instantly see which comments are positive, negative, or need urgent attention. Catch issues early.",
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "Auto-Moderation",
    description:
      "Automatically hide spam, bots, and inappropriate comments so your pages stay clean.",
  },
  {
    icon: Star,
    emoji: "⭐",
    title: "Review Management",
    description:
      "Respond to reviews on Google, Facebook, Trustpilot, Yelp, and more—all from one place.",
  },
  {
    icon: TrendingUp,
    emoji: "📈",
    title: "Simple Analytics",
    description:
      "Track your response times, see what's working, and understand how engagement is helping your business.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to stay on top of engagement
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple tools that save you hours every week.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
