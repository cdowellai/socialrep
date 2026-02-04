import { Target, Zap, BarChart3, Shield, Star, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    emoji: "🎯",
    title: "Brand Voice Training",
    description:
      "Upload past responses and our AI learns exactly how you communicate—casual, professional, or somewhere in between.",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "One-Click Approve",
    description:
      "Review AI-drafted responses and send with a single click. Or set rules to auto-respond and save even more time.",
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Sentiment Analysis",
    description:
      "Instantly know if comments are positive, negative, or neutral. Spot trends and address issues before they escalate.",
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "Auto-Moderation",
    description:
      "Automatically hide spam, filter profanity, and remove toxic comments before they damage your brand.",
  },
  {
    icon: Star,
    emoji: "⭐",
    title: "Review Management",
    description:
      "Respond to Google, Yelp, and Facebook reviews from one place. Turn negative reviews into recovery opportunities.",
  },
  {
    icon: TrendingUp,
    emoji: "📈",
    title: "Performance Analytics",
    description:
      "Track response times, sentiment trends, and team performance. Know exactly how engagement impacts your bottom line.",
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
            Built for teams drowning in engagement
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to turn comments into customers—at scale.
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
