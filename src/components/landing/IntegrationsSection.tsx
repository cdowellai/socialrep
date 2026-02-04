const socialPlatforms = [
  { name: "Facebook", color: "bg-[#1877F2]" },
  { name: "Instagram", color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]" },
  { name: "TikTok", color: "bg-foreground" },
  { name: "YouTube", color: "bg-[#FF0000]" },
  { name: "LinkedIn", color: "bg-[#0A66C2]" },
];

const reviewPlatforms = [
  { name: "Google Business", color: "bg-[#4285F4]" },
  { name: "Trustpilot", color: "bg-[#00B67A]" },
  { name: "Yelp", color: "bg-[#D32323]" },
  { name: "BBB", color: "bg-[#005A78]" },
  { name: "Facebook Reviews", color: "bg-[#1877F2]" },
  { name: "More", color: "bg-muted-foreground" },
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Connects to the platforms you already use
          </h2>
          <p className="text-lg text-muted-foreground">
            Comments, DMs, and reviews—all in one dashboard.
          </p>
        </div>

        {/* Social Platforms */}
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-sm font-medium text-muted-foreground text-center mb-4">
            Social Platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialPlatforms.map((platform, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                <span className="font-medium text-sm">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Platforms */}
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium text-muted-foreground text-center mb-4">
            Review Platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {reviewPlatforms.map((platform, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                <span className="font-medium text-sm">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
