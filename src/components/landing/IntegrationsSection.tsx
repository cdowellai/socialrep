const socialPlatforms = [
  { name: "Facebook", color: "hsl(221, 44%, 41%)" },
  { name: "Instagram", color: "hsl(330, 72%, 52%)" },
  { name: "TikTok", color: "hsl(0, 0%, 10%)" },
  { name: "YouTube", color: "hsl(0, 84%, 50%)" },
  { name: "LinkedIn", color: "hsl(201, 100%, 35%)" },
];

const reviewPlatforms = [
  { name: "Google Business", color: "hsl(12, 83%, 55%)" },
  { name: "Trustpilot", color: "hsl(152, 76%, 43%)" },
  { name: "Yelp", color: "hsl(0, 84%, 60%)" },
  { name: "BBB", color: "hsl(210, 60%, 40%)" },
  { name: "Facebook Reviews", color: "hsl(221, 44%, 41%)" },
];

function PlatformPill({ name, color }: { name: string; color: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-default">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Integrations</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Connects to the platforms you already use
          </h2>
          <p className="text-lg text-muted-foreground">
            Monitor and respond to comments, DMs, and reviews across every major platform — from one dashboard.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">Social Platforms</p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((p) => (
                <PlatformPill key={p.name} {...p} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">Review Platforms</p>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((p) => (
                <PlatformPill key={p.name} {...p} />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            New integrations added regularly.{" "}
            <a href="#" className="text-primary hover:underline font-medium">Request an integration →</a>
          </p>
        </div>
      </div>
    </section>
  );
}
