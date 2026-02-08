const painPoints = [
  {
    emoji: "📱",
    title: "6 apps open. Still missing messages.",
    body: "Facebook DMs in one tab, Google reviews in another, Instagram comments in a third. You check one, miss two. It's not a workflow — it's whack-a-mole.",
    stat: "→ Businesses miss 62% of social messages",
  },
  {
    emoji: "⏱️",
    title: "A 1-star review sat there for 3 days.",
    body: "You didn't see it. Your competitor did. 53% of people expect a review response within a week. Most businesses take two weeks or more.",
    stat: "→ Every hour of delay = lower win-back rate",
  },
  {
    emoji: "🤖",
    title: "'Thanks for your feedback!' — said every robot.",
    body: "Generic auto-replies make things worse. Customers can smell a template. You need responses that sound like you wrote them at 9am with your coffee.",
    stat: "→ Personalized responses get 4x more engagement",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-24 bg-foreground relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
            The reality right now
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white">
            You're losing customers while you're busy running your business
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <span className="text-4xl mb-4 block">{point.emoji}</span>
              <h3 className="text-xl font-semibold text-white mb-3">{point.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">{point.body}</p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-primary text-sm font-medium">{point.stat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
