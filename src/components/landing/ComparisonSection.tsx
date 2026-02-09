import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight, Check, Minus } from "lucide-react";

const rows = [
  { feature: "Primary focus", other: "Publishing & scheduling", ours: "Responding & reputation" },
  { feature: "AI responses", other: "None or basic templates", ours: "Drafts in your brand voice" },
  { feature: "Review management", other: "Basic monitoring", ours: "AI-powered respond from one inbox" },
  { feature: "Response time tracking", other: "Not available", ours: "Per-platform with SLA alerts" },
  { feature: "Sentiment analysis", other: "Limited", ours: "AI-powered on every interaction" },
  { feature: "Starting price", other: "$99–$299/mo", ours: "$79/mo" },
];

export function ComparisonSection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Why SocialRep</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Built for reputation management. Not bolted on.
            </h2>
            <p className="text-lg text-muted-foreground">
              Most social tools are built for publishing and scheduling. SocialRep is built for the other side — responding, resolving, and protecting your reputation.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              {/* Header */}
              <div className="grid grid-cols-3 text-sm font-semibold border-b border-border">
                <div className="px-5 py-4"></div>
                <div className="px-5 py-4 text-muted-foreground text-center">Other Tools</div>
                <div className="px-5 py-4 text-primary text-center">SocialRep</div>
              </div>
              {rows.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 text-sm ${i < rows.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="px-5 py-3.5 font-medium">{row.feature}</div>
                  <div className="px-5 py-3.5 text-muted-foreground text-center flex items-center justify-center gap-1.5">
                    <Minus className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-xs">{row.other}</span>
                  </div>
                  <div className="px-5 py-3.5 text-center flex items-center justify-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">{row.ours}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="hero" size="lg" onClick={() => setAuthModal(true)}>
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
