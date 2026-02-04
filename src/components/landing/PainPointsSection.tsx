import { Smartphone, Shuffle, Clock } from "lucide-react";

const painPoints = [
  {
    icon: Smartphone,
    emoji: "📱",
    title: "Thousands of comments, zero time",
    body: "Your Meta ads are crushing it—but responding to thousands of comments manually? That's a full-time job you didn't sign up for.",
  },
  {
    icon: Shuffle,
    emoji: "🔀",
    title: "Tool sprawl is killing you",
    body: "Hootsuite for comments. Birdeye for reviews. Another app for DMs. You're paying for 4 tools and none of them talk to each other.",
  },
  {
    icon: Clock,
    emoji: "⏰",
    title: "Slow responses = lost revenue",
    body: "Every unanswered comment is a missed conversion. Every ignored review is a reputation hit. Speed matters—and you can't keep up.",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            The Problem
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sound familiar?</h2>
          <p className="text-lg text-muted-foreground">
            You're scaling your ads, but your engagement is buried in chaos.
          </p>
        </div>

        {/* Pain Points Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-destructive/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{point.emoji}</div>
              <h3 className="font-semibold text-lg mb-3">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
