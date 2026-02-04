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
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-tag mb-4 inline-block">The Problem</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-foreground-secondary">
            You're scaling your ads, but your engagement is buried in chaos.
          </p>
        </div>

        {/* Pain Point Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="problem-card p-6 rounded-xl bg-background-secondary border border-border animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4">{point.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
              <p className="text-foreground-secondary">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
