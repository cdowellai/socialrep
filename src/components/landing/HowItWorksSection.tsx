import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    num: "1",
    title: "Connect your platforms",
    body: "Link your Facebook, Instagram, Google Business, Yelp, and other accounts. Takes about 2 minutes per platform. SocialRep starts pulling in your messages, comments, and reviews immediately.",
  },
  {
    num: "2",
    title: "Train your AI voice",
    body: "Describe your brand tone and paste a few example responses. The AI learns how you communicate — friendly, professional, casual, whatever fits. Takes 5 minutes.",
  },
  {
    num: "3",
    title: "Respond 10x faster",
    body: "Every new interaction arrives in your Smart Inbox with an AI-drafted response ready to go. Edit if you want, or just hit send. Set rules to auto-handle the easy ones while you focus on what matters.",
  },
];

export function HowItWorksSection() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">How It Works</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Up and running in 15 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] border-t-2 border-dashed border-border" />

            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-5 relative z-10">
                  {step.num}
                </div>
                <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => setAuthModal(true)}>
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
