import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight, TrendingUp, TrendingDown, Star, Sparkles, Clock } from "lucide-react";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const handleScrollToHowItWorks = () => {
    const element = document.querySelector("#how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const kpiCards = [
    { label: "Inbox", value: "127", change: "+18%", positive: true },
    { label: "Sentiment", value: "84%", change: "+3%", positive: true },
    { label: "Leads", value: "23", change: "+5 new", positive: true },
    { label: "Avg Response", value: "1.2h", change: "↓ from 4.8h", positive: true },
  ];

  const inboxItems = [
    { name: "@sarah_designs", message: "Love this product! Do you ship to Miami? ✨", tag: "Positive", tagColor: "bg-sentiment-positive" },
    { name: "Mike Thompson", message: "Still waiting on my order. No response to emails.", tag: "Urgent", tagColor: "bg-sentiment-negative" },
    { name: "Alex Chen", message: "Outstanding service and quick delivery!", tag: "★★★★★", tagColor: "bg-sentiment-neutral" },
    { name: "Jen Rivera", message: "Can I get a refund? This wasn't what I expected.", tag: "AI Draft Ready", tagColor: "bg-primary" },
  ];

  const chartBars = [65, 45, 80, 55, 70, 40, 85, 60, 75, 50, 90, 68];

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center pt-24 pb-16 overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in leading-tight">
              Stop drowning in comments.
              <br />
              <span>Let AI respond </span>
              <span className="text-gradient">in your voice.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              SocialRep uses AI to pull your comments, messages, and reviews from every platform into one inbox — then drafts on-brand responses you can approve and send in one click.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" onClick={() => setAuthModal(true)}>
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleScrollToHowItWorks}>
                See How It Works
              </Button>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span>14-Day Free Trial</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>No Credit Card Required</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>Cancel Anytime</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>SOC 2 Compliant</span>
            </div>
          </div>

          {/* Browser Chrome Mockup */}
          <div className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="rounded-xl shadow-2xl border border-border overflow-hidden bg-card">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background rounded-md px-4 py-1.5 text-xs text-muted-foreground border border-border">
                    app.socialrep.ai/dashboard
                  </div>
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard Content */}
              <div className="p-4 md:p-6 bg-background">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {kpiCards.map((kpi, i) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">{kpi.value}</span>
                        <span className={`text-xs ${kpi.positive ? "text-sentiment-positive" : "text-sentiment-negative"}`}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chart */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="text-sm font-medium mb-3">Interaction Volume</div>
                    <div className="flex items-end gap-1 h-24">
                      {chartBars.map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/80 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Smart Inbox */}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="text-sm font-medium mb-3">Smart Inbox</div>
                    <div className="space-y-2">
                      {inboxItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <div 
                            className="w-6 h-6 rounded-full flex-shrink-0"
                            style={{ backgroundColor: `hsl(${(i * 60) + 200}, 70%, 60%)` }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.name}</div>
                            <div className="text-muted-foreground truncate">{item.message}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-white text-[10px] whitespace-nowrap ${item.tagColor}`}>
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
