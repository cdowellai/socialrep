import {
  MessageSquare,
  Brain,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Unified Smart Inbox",
    description:
      "All your comments, DMs, mentions, and reviews from 150+ platforms in one dashboard with AI-powered prioritization.",
  },
  {
    icon: Brain,
    title: "AI Response Generation",
    description:
      "Context-aware replies in your brand voice. Sentiment analysis and automatic escalation for urgent issues.",
  },
  {
    icon: Star,
    title: "Review Management",
    description:
      "Aggregate reviews from Google, Yelp, and 150+ sites. Auto-send review requests and manage reputation scoring.",
  },
  {
    icon: TrendingUp,
    title: "Proactive Listening",
    description:
      "Monitor trends, track competitors, and get AI-suggested content based on industry conversations.",
  },
  {
    icon: Users,
    title: "Lead Generation",
    description:
      "Detect potential leads from social interactions and automatically sync to your CRM like HubSpot.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "ROI dashboard, sentiment trends, performance predictions, and exportable reports.",
  },
  {
    icon: Zap,
    title: "Automation Rules",
    description:
      "Create custom workflows to auto-respond, escalate, or tag interactions based on keywords and sentiment.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "GDPR compliant with role-based access control, audit logs, and data encryption.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Dominate Social</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Replace Hootsuite and enhance Birdeye with our all-in-one AI-powered
            platform designed for modern businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
