import { Smartphone, Shuffle, Clock } from "lucide-react";

const painPoints = [
  {
    icon: Smartphone,
    title: "Comments pile up fast",
    body: "You're running ads, posting content, and getting traction—but who has time to respond to every comment and DM? They add up quick.",
  },
  {
    icon: Shuffle,
    title: "Too many tools, too many tabs",
    body: "One app for social, another for reviews, another for messages. You're juggling platforms instead of running your business.",
  },
  {
    icon: Clock,
    title: "Slow replies cost you customers",
    body: "When someone asks a question or leaves a review, they expect a fast response. Every hour you wait is a customer who moves on.",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-medium text-primary mb-3 animate-fade-in">
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            You're growing your business, but customer engagement is slipping through the cracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <point.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
              <p className="text-muted-foreground">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
