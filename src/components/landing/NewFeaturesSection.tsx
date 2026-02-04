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

export function NewFeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-tag mb-4 inline-block">Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Built for teams drowning in engagement
          </h2>
          <p className="text-lg text-foreground-secondary">
            Everything you need to turn comments into customers—at scale.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-4">{feature.emoji}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
