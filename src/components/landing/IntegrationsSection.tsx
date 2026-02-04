const socialPlatforms = [
  { name: "Facebook", icon: "📘" },
  { name: "Instagram", icon: "📸" },
  { name: "TikTok", icon: "🎵" },
  { name: "YouTube", icon: "▶️" },
  { name: "LinkedIn", icon: "💼" },
];

const reviewPlatforms = [
  { name: "Google Business", icon: "🔍" },
  { name: "Trustpilot", icon: "⭐" },
  { name: "Yelp", icon: "🍽️" },
  { name: "BBB", icon: "🏛️" },
  { name: "Facebook Reviews", icon: "👍" },
  { name: "More", icon: "➕" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-sm font-medium text-primary mb-3 animate-fade-in">
            Integrations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Connects to the platforms you already use
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Comments, DMs, and reviews—all in one dashboard.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Social Platforms */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">Social Platforms</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors"
                >
                  <span>{platform.icon}</span>
                  <span className="font-medium text-sm">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Platforms */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">Review Platforms</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors"
                >
                  <span>{platform.icon}</span>
                  <span className="font-medium text-sm">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
