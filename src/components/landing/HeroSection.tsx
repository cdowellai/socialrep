import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight, Play, Sparkles, MessageSquare, Star, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const stats = [
    { value: "80%", label: "Automated Responses" },
    { value: "150+", label: "Connected Platforms" },
    { value: "3x", label: "Faster Response Time" },
  ];

  return (
    <>
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Background image overlay for dark mode */}
        <div 
          className="absolute inset-0 opacity-0 dark:opacity-30 bg-cover bg-center transition-opacity"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                AI-Powered Social Management
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Manage Your{" "}
              <span className="text-gradient">Social Reputation</span>
              {" "}on Autopilot
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Unify all your social interactions, reviews, and mentions in one AI-powered hub. 
              Automate 80% of responses while maintaining your authentic brand voice.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" onClick={() => setAuthModal(true)}>
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
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

              {/* Dashboard Preview Content */}
              <div className="p-6 bg-gradient-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Inbox Preview */}
                  <div className="col-span-2 p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Smart Inbox
                      </h3>
                      <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                        12 new
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { platform: "Instagram", sentiment: "positive", message: "Love your product! 🔥" },
                        { platform: "Google", sentiment: "neutral", message: "Good service, could be faster..." },
                        { platform: "Twitter", sentiment: "negative", message: "Still waiting for support..." },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full ${
                            item.sentiment === "positive" ? "bg-sentiment-positive" :
                            item.sentiment === "negative" ? "bg-sentiment-negative" : "bg-sentiment-neutral"
                          }`} />
                          <span className="text-xs font-medium text-muted-foreground">{item.platform}</span>
                          <span className="text-sm truncate">{item.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Preview */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-background border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-sentiment-neutral" />
                        <span className="text-sm text-muted-foreground">Avg Rating</span>
                      </div>
                      <div className="text-3xl font-bold">4.7</div>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-sentiment-positive" />
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                      </div>
                      <div className="text-3xl font-bold">94%</div>
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
