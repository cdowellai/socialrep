import { Smartphone, Shuffle, Clock } from "lucide-react";

const painPoints = [
  {
    icon: Smartphone,
    emoji: "📱",
    title: "Comments pile up fast",
    description:
      "You're running ads, posting content, and getting traction—but who has time to respond to every comment and DM? They add up quick.",
  },
  {
    icon: Shuffle,
    emoji: "🔀",
    title: "Too many tools, too many tabs",
    description:
      "One app for social, another for reviews, another for messages. You're juggling platforms instead of running your business.",
  },
  {
    icon: Clock,
    emoji: "⏰",
    title: "Slow replies cost you customers",
    description:
      "When someone asks a question or leaves a review, they expect a fast response. Every hour you wait is a customer who moves on.",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
            <span className="text-sm font-medium text-accent-foreground">
              The Problem
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground">
            You're growing your business, but customer engagement is slipping through the cracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{point.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
