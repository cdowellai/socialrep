import { Check, Zap, AlertTriangle } from "lucide-react";

const features = [
  {
    title: "Unified inbox",
    description: "Comments, DMs, and reviews from every platform in one place",
  },
  {
    title: "AI responses",
    description: "Drafts that sound like you, ready to send in one click",
  },
  {
    title: "Smart prioritization",
    description: "See complaints, questions, and hot leads first",
  },
  {
    title: "Auto-moderation",
    description: "Hide spam and filter inappropriate comments automatically",
  },
];

export function SolutionSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column - Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-6">
              <span className="text-sm font-medium text-accent-foreground">
                The Solution
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One inbox. Every channel.{" "}
              <span className="text-gradient">AI that actually gets it.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              SocialRep brings your comments, messages, and reviews into a single dashboard—then uses AI to draft responses that match your voice, flag what needs attention, and keep your engagement running while you focus on your business.
            </p>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-sentiment-positive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-sentiment-positive" />
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
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-sentiment-neutral/50" />
                  <div className="w-3 h-3 rounded-full bg-sentiment-positive/50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground">
                    app.socialrep.ai/inbox
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 bg-gradient-card">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Pending</span>
                      <span className="px-2 py-0.5 rounded-full bg-sentiment-positive/10 text-sentiment-positive text-xs font-medium">
                        Live
                      </span>
                    </div>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Responded Today</div>
                    <div className="text-2xl font-bold">89</div>
                  </div>
                </div>

                {/* Comment Feed */}
                <div className="space-y-3">
                  {/* Comment 1 */}
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                        SD
                      </div>
                      <span className="text-sm font-medium">@sarah_designs</span>
                    </div>
                    <p className="text-sm mb-2">Do you guys deliver to Miami?</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      <Zap className="h-3 w-3" />
                      AI Draft Ready — Click to send
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        MT
                      </div>
                      <span className="text-sm font-medium">@mike_thompson</span>
                    </div>
                    <p className="text-sm mb-2">Still waiting on my order from last week...</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sentiment-negative/10 text-sentiment-negative text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Priority — Complaint detected
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
