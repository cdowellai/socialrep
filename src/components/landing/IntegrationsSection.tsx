const socialPlatforms = [
  { name: "Facebook", color: "bg-[#1877F2]" },
  { name: "Instagram", color: "bg-[#E4405F]" },
  { name: "TikTok", color: "bg-foreground" },
  { name: "YouTube", color: "bg-[#FF0000]" },
  { name: "LinkedIn", color: "bg-[#0A66C2]" },
];

const reviewPlatforms = [
  { name: "Google Business", color: "bg-[#EA4335]" },
  { name: "Trustpilot", color: "bg-[#00B67A]" },
  { name: "Yelp", color: "bg-[#D32323]" },
  { name: "BBB", color: "bg-[#0056A4]" },
  { name: "Facebook Reviews", color: "bg-[#1877F2]" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
            Integrations
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            Connects to the platforms you already use
          </h2>
          <p className="text-muted-foreground text-lg">
            Pull in every comment, review, and message automatically. No copy-paste, no missed notifications.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Social Platforms */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Social Platforms</p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((platform, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-full hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all cursor-default"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Platforms */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Review Platforms</p>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((platform, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-full hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all cursor-default"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            More platforms launching monthly.{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Request an integration →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
