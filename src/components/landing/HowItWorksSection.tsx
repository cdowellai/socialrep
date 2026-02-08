import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const [authModal, setAuthModal] = useState(false);

  const steps = [
    {
      number: "1",
      title: "Connect your platforms",
      body: "Link your Facebook, Instagram, Google Business, Yelp, and other accounts. Takes about 2 minutes per platform. SocialRep starts pulling in your messages, comments, and reviews immediately.",
    },
    {
      number: "2",
      title: "Train your AI voice",
      body: "Describe your brand tone and paste a few example responses you've sent before. The AI learns how you communicate — friendly, professional, casual, whatever fits your brand. Takes 5 minutes.",
    },
    {
      number: "3",
      title: "Respond 10x faster",
      body: "Every new interaction arrives in your Smart Inbox with an AI-drafted response ready to review. Edit if you want, or just hit send. Set rules to auto-handle the easy ones while you focus on what matters.",
    },
  ];

  return (
    <>
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Up and running in 15 minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Three steps between you and never missing another message.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-border" />

              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-card rounded-2xl border border-border p-6 text-center h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6 relative z-10">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Button variant="hero" size="lg" onClick={() => setAuthModal(true)}>
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
