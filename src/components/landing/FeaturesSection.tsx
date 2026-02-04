import { Target, Zap, BarChart3, Shield, Star, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Brand Voice Training",
    description: "Show the AI how you talk to customers, and it learns your style—friendly, professional, or however you communicate.",
  },
  {
    icon: Zap,
    title: "One-Click Responses",
    description: "Review what the AI drafts, then send with a single click. Or set rules to auto-reply to common questions.",
  },
  {
    icon: BarChart3,
    title: "Sentiment Detection",
    description: "Instantly see which comments are positive, negative, or need urgent attention. Catch issues early.",
  },
  {
    icon: Shield,
    title: "Auto-Moderation",
    description: "Automatically hide spam, bots, and inappropriate comments so your pages stay clean.",
  },
  {
    icon: Star,
    title: "Review Management",
    description: "Respond to reviews on Google, Facebook, Trustpilot, Yelp, and more—all from one place.",
  },
  {
    icon: TrendingUp,
    title: "Simple Analytics",
    description: "Track your response times, see what's working, and understand how engagement is helping your business.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-sm font-medium text-primary mb-3 animate-fade-in">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Everything you need to stay on top of engagement
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Simple tools that save you hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
