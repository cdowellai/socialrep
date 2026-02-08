import { useState } from "react";

export function IntegrationsSection() {
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);

  const socialPlatforms = [
    { name: "Facebook", color: "bg-platform-facebook" },
    { name: "Instagram", color: "bg-platform-instagram" },
    { name: "TikTok", color: "bg-foreground" },
    { name: "YouTube", color: "bg-destructive" },
    { name: "LinkedIn", color: "bg-platform-linkedin" },
  ];

  const reviewPlatforms = [
    { name: "Google Business", color: "bg-platform-google" },
    { name: "Trustpilot", color: "bg-sentiment-positive" },
    { name: "Yelp", color: "bg-destructive" },
    { name: "BBB", color: "bg-platform-facebook" },
    { name: "Facebook Reviews", color: "bg-platform-facebook" },
  ];

  return (
    <section id="integrations" className="py-24 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Integrations
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Connects to the platforms you already use
          </h2>
          <p className="text-lg text-muted-foreground">
            Monitor and respond to comments, DMs, and reviews across every major platform — from one dashboard.
          </p>
        </div>

        {/* Platform Pills */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Social Platforms */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-4 text-center">
              Social Platforms
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-card border transition-all duration-200 ${
                    hoveredPill === platform.name 
                      ? "border-primary shadow-glow" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onMouseEnter={() => setHoveredPill(platform.name)}
                  onMouseLeave={() => setHoveredPill(null)}
                >
                  <div className={`w-2 h-2 rounded-full ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Review Platforms */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-4 text-center">
              Review Platforms
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-card border transition-all duration-200 ${
                    hoveredPill === platform.name 
                      ? "border-primary shadow-glow" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onMouseEnter={() => setHoveredPill(platform.name)}
                  onMouseLeave={() => setHoveredPill(null)}
                >
                  <div className={`w-2 h-2 rounded-full ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            New integrations added regularly.{" "}
            <a href="#" className="text-primary hover:underline">
              Request an integration →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
