const integrations = [
  { name: "Meta / Facebook", icon: "📘" },
  { name: "Instagram", icon: "📸" },
  { name: "TikTok", icon: "🎵" },
  { name: "Google Business", icon: "🔍" },
  { name: "YouTube", icon: "▶️" },
  { name: "LinkedIn", icon: "💼" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-background-secondary relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-tag mb-4 inline-block">Integrations</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Connects to everything you use
          </h2>
          <p className="text-lg text-foreground-secondary">
            One dashboard for all your engagement channels.
          </p>
        </div>

        {/* Integration Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="integration-badge animate-fade-in-up hover:border-accent/50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-xl">{integration.icon}</span>
              <span>{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
