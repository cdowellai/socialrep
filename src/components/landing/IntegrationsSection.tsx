const socialPlatforms = [
  { name: "Facebook", color: "bg-[#1877F2]" },
  { name: "Instagram", color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]" },
  { name: "TikTok", color: "bg-[#000000] dark:bg-[#ffffff] dark:text-[#000000]" },
  { name: "YouTube", color: "bg-[#FF0000]" },
  { name: "LinkedIn", color: "bg-[#0A66C2]" },
];

const reviewPlatforms = [
  { name: "Google Business", color: "bg-[#4285F4]" },
  { name: "Trustpilot", color: "bg-[#00B67A]" },
  { name: "Yelp", color: "bg-[#D32323]" },
  { name: "BBB", color: "bg-[#005A8B]" },
  { name: "Facebook Reviews", color: "bg-[#1877F2]" },
  { name: "More", color: "bg-muted text-muted-foreground" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
            <span className="text-sm font-medium text-accent-foreground">
              Integrations
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Connects to the platforms{" "}
            <span className="text-gradient">you already use</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comments, DMs, and reviews—all in one dashboard.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Social Platforms */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              Social Platforms
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((platform, index) => (
                <div
                  key={index}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium text-white ${platform.color} shadow-md hover:shadow-lg transition-shadow`}
                >
                  {platform.name}
                </div>
              ))}
            </div>
          </div>

          {/* Review Platforms */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              Review Platforms
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((platform, index) => (
                <div
                  key={index}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium ${platform.name === "More" ? "" : "text-white"} ${platform.color} shadow-md hover:shadow-lg transition-shadow`}
                >
                  {platform.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
