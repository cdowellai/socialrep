import { Check, Zap, AlertTriangle } from "lucide-react";

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
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentiment-positive/10 text-sentiment-positive text-sm font-medium mb-4">
              The Solution
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              One inbox. Every channel.
              <br />
              <span className="text-gradient">AI that actually gets it.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              SocialRep unifies your comments, messages, and reviews into a single dashboard—then
              uses AI to draft responses that match your brand voice, flag priority items, and keep
              your engagement running 24/7.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-sentiment-positive/10 flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-sentiment-positive" />
                  </div>
                  <div>
                    <span className="font-medium">{feature.title}</span>
                    <span className="text-muted-foreground"> — {feature.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Mock Dashboard */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-sentiment-neutral/80" />
                  <div className="w-3 h-3 rounded-full bg-sentiment-positive/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground">SocialRep Dashboard</span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 space-y-4">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Pending</span>
                      <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                        Live
                      </span>
                    </div>
                    <div className="text-2xl font-bold">847</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-2">Responded Today</div>
                    <div className="text-2xl font-bold text-sentiment-positive">2,341</div>
                  </div>
                </div>

                {/* Comment Feed */}
                <div className="space-y-3">
                  {/* Comment 1 */}
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">@sarah_designs</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          OMG how much is this?? I need it 😍
                        </div>
                        <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/10 w-fit">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            AI Draft Ready — Click to send
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="p-3 rounded-xl bg-background border border-destructive/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">@mike_thompson</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Still waiting on my order from 2 weeks ago...
                        </div>
                        <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-destructive/10 w-fit">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          <span className="text-xs font-medium text-destructive">
                            Priority — Complaint detected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl blur-3xl -z-10 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}
