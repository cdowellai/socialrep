import { Check, Zap, AlertTriangle, Bot, TrendingUp, Users, MessageSquare, Star, ThumbsUp, Clock } from "lucide-react";

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
                    app.socialrep.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 bg-gradient-card">
                {/* KPI Stats Row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-background border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-lg font-bold">127</div>
                    <div className="text-[10px] text-muted-foreground">Inbox</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ThumbsUp className="h-3.5 w-3.5 text-sentiment-positive" />
                    </div>
                    <div className="text-lg font-bold">84%</div>
                    <div className="text-[10px] text-muted-foreground">Sentiment</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-lg font-bold">23</div>
                    <div className="text-[10px] text-muted-foreground">Leads</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-3.5 w-3.5 text-sentiment-neutral" />
                    </div>
                    <div className="text-lg font-bold">1.2h</div>
                    <div className="text-[10px] text-muted-foreground">Avg Time</div>
                  </div>
                </div>

                {/* Comment Feed */}
                <div className="space-y-2.5">
                  {/* Comment 1 - Instagram with AI Draft */}
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] flex items-center justify-center text-xs text-white font-medium">
                          IG
                        </div>
                        <div>
                          <span className="text-sm font-medium">@sarah_designs</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sentiment-positive/10 text-sentiment-positive">Positive</span>
                            <span className="text-[10px] text-muted-foreground">2m ago</span>
                          </div>
                        </div>
                      </div>
                      <Star className="h-4 w-4 text-sentiment-neutral" />
                    </div>
                    <p className="text-sm mb-2">Love this product! Do you ship to Miami? 🙌</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      <Bot className="h-3 w-3" />
                      AI Draft Ready — "Thanks so much! Yes, we ship to..."
                    </div>
                  </div>

                  {/* Comment 2 - Facebook Complaint */}
                  <div className="p-3 rounded-xl bg-background border border-sentiment-negative/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-xs text-white font-medium">
                          FB
                        </div>
                        <div>
                          <span className="text-sm font-medium">Mike Thompson</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sentiment-negative/10 text-sentiment-negative">Negative</span>
                            <span className="text-[10px] text-muted-foreground">15m ago</span>
                          </div>
                        </div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-sentiment-negative" />
                    </div>
                    <p className="text-sm mb-2">Still waiting on my order from last week. No response to emails.</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sentiment-negative/10 text-sentiment-negative text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Priority — Escalated to Support Team
                    </div>
                  </div>

                  {/* Comment 3 - Google Review */}
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#4285F4] flex items-center justify-center text-xs text-white font-medium">
                          G
                        </div>
                        <div>
                          <span className="text-sm font-medium">Alex Chen</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex">
                              {[1,2,3,4,5].map((i) => (
                                <Star key={i} className="h-2.5 w-2.5 text-sentiment-neutral fill-sentiment-neutral" />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">Review</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mb-2">"Outstanding service and quick delivery. Highly recommend!"</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sentiment-positive/10 text-sentiment-positive text-xs font-medium">
                      <Zap className="h-3 w-3" />
                      Auto-responded with thank you template
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Chatbot Active
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
