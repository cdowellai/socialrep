import { Check, Zap, AlertTriangle } from "lucide-react";

const features = [
  "Unified inbox — Comments, DMs, and reviews from every platform in one place",
  "AI responses — Drafts that sound like you, ready to send in one click",
  "Smart prioritization — See complaints, questions, and hot leads first",
  "Auto-moderation — Hide spam and filter inappropriate comments automatically",
];

export function SolutionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column - Text */}
          <div className="animate-fade-in">
            <span className="inline-block text-sm font-medium text-primary mb-3">
              The Solution
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              One inbox. Every channel. AI that actually gets it.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              SocialRep brings your comments, messages, and reviews into a single dashboard—then uses AI to draft responses that match your voice, flag what needs attention, and keep your engagement running while you focus on your business.
            </p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Mock Dashboard */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-1 rounded-md bg-background/50 text-xs text-muted-foreground">
                    app.socialrep.ai
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-5 space-y-4">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                        Live
                      </span>
                    </div>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <span className="text-sm text-muted-foreground">Responded Today</span>
                    <div className="text-2xl font-bold mt-2">89</div>
                  </div>
                </div>

                {/* Comment Feed */}
                <div className="space-y-3">
                  {/* Comment 1 */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
                      <span className="font-medium text-sm">@sarah_designs</span>
                    </div>
                    <p className="text-sm mb-3">Do you guys deliver to Miami?</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary font-medium">AI Draft Ready — Click to send</span>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500" />
                      <span className="font-medium text-sm">@mike_thompson</span>
                    </div>
                    <p className="text-sm mb-3">Still waiting on my order from last week...</p>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-amber-500 font-medium">Priority — Complaint detected</span>
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
