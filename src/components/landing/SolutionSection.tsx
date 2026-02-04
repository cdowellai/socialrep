import { Check } from "lucide-react";

const features = [
  {
    title: "Unified inbox",
    description: "Comments, DMs, reviews from Meta, Google, TikTok, and more",
  },
  {
    title: "AI responses",
    description: "Trained on your brand voice, approved in one click",
  },
  {
    title: "Smart prioritization",
    description: "Surface complaints, buying signals, and VIPs first",
  },
  {
    title: "Auto-moderation",
    description: "Hide spam, filter toxicity, protect your brand",
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 bg-background-secondary relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-glow opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text */}
          <div className="animate-fade-in-up">
            <span className="section-tag mb-4 inline-block">The Solution</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              One inbox. Every channel.{" "}
              <span className="text-gradient-accent">AI that actually gets it.</span>
            </h2>
            <p className="text-lg text-foreground-secondary mb-8">
              SocialRep unifies your comments, messages, and reviews into a single
              dashboard—then uses AI to draft responses that match your brand
              voice, flag priority items, and keep your engagement running 24/7.
            </p>

            {/* Feature Checklist */}
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <span className="font-semibold">{feature.title}</span>
                    <span className="text-foreground-secondary">
                      {" "}
                      — {feature.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Mock Dashboard */}
          <div className="animate-fade-in-up delay-200">
            <div className="rounded-xl border border-border bg-background-tertiary overflow-hidden shadow-2xl">
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background-secondary">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-sm text-foreground-muted">
                  SocialRep Dashboard
                </span>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-background-secondary border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-foreground-muted uppercase tracking-wide">
                        Pending
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                        Live
                      </span>
                    </div>
                    <div className="text-2xl font-bold font-mono">847</div>
                  </div>
                  <div className="p-4 rounded-lg bg-background-secondary border border-border">
                    <div className="text-xs text-foreground-muted uppercase tracking-wide mb-2">
                      Responded Today
                    </div>
                    <div className="text-2xl font-bold font-mono text-accent">
                      2,341
                    </div>
                  </div>
                </div>

                {/* Comment Feed */}
                <div className="space-y-3">
                  {/* Comment 1 */}
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-accent" />
                      <span className="text-sm font-medium">@sarah_designs</span>
                    </div>
                    <p className="text-sm text-foreground-secondary mb-3">
                      OMG how much is this?? I need it 😍
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-3 py-1.5 rounded-full bg-accent/20 text-accent font-medium">
                        ⚡ AI Draft Ready — Click to send
                      </span>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-foreground-muted" />
                      <span className="text-sm font-medium">@mike_thompson</span>
                    </div>
                    <p className="text-sm text-foreground-secondary mb-3">
                      Still waiting on my order from 2 weeks ago...
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-3 py-1.5 rounded-full bg-destructive/20 text-destructive font-medium">
                        ⚠️ Priority — Complaint detected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
