export function PainPointsSection() {
  const painPoints = [
    {
      emoji: "📱",
      title: "Comments pile up. Customers move on.",
      body: "You're running ads, posting content, getting traction — but who has time to respond to every comment, DM, and review across 6 platforms? They add up fast. And every one you miss is a customer who stops waiting.",
      stat: "→ The average business misses 62% of social messages",
    },
    {
      emoji: "⏱️",
      title: "Slow replies cost you real money.",
      body: "When someone leaves a review or asks a question, they expect a fast response. Every hour you wait, the chance of winning them back drops. Your competitor down the street? They're already replying.",
      stat: "→ Customers expect a response within hours, not days",
    },
    {
      emoji: "🤖",
      title: "Generic responses do more harm than good.",
      body: "Customers can spot a template from a mile away. 'Thanks for your feedback!' doesn't cut it. You need responses that sound like they came from a human who actually read the message — because they did.",
      stat: "→ Personalized responses get 4x more engagement",
    },
  ];

  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Sound familiar?
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            You're growing your business.
            <br />
            Your inbox is growing faster.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="bg-background/5 border border-background/10 rounded-2xl p-6 flex flex-col"
            >
              <div className="text-4xl mb-4">{point.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
              <p className="text-background/70 text-sm leading-relaxed flex-1">
                {point.body}
              </p>
              <div className="mt-6 pt-4 border-t border-background/10">
                <p className="text-sm text-primary font-medium">{point.stat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
