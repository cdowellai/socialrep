const integrations = [
  { name: "Meta / Facebook", color: "bg-[#1877F2]" },
  { name: "Instagram", color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]" },
  { name: "TikTok", color: "bg-foreground" },
  { name: "Google Business", color: "bg-[#4285F4]" },
  { name: "YouTube", color: "bg-[#FF0000]" },
  { name: "LinkedIn", color: "bg-[#0A66C2]" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Integrations
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Connects to everything you use</h2>
          <p className="text-lg text-muted-foreground">
            One dashboard for all your engagement channels.
          </p>
        </div>

        {/* Integration Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-3 h-3 rounded-full ${integration.color}`} />
              <span className="font-medium text-sm">{integration.name}</span>
            </div>
          ))}
        </div>

        {/* Coming Soon Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          + Twitter/X, WhatsApp, Telegram, and more coming soon
        </p>
      </div>
    </section>
  );
}
