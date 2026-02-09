import { Inbox, Sparkles, TrendingUp } from "lucide-react";

const columns = [
  {
    icon: Inbox,
    title: "Unified Inbox",
    description: "Comments from Facebook, DMs from Instagram, reviews from Google and Yelp — all in one feed. No more switching between 6 tabs to keep up.",
  },
  {
    icon: Sparkles,
    title: "AI-Drafted Responses",
    description: "SocialRep reads every message and drafts a response in your brand voice. You review it, edit if you want, and send — in seconds instead of minutes.",
  },
  {
    icon: TrendingUp,
    title: "Reputation Analytics",
    description: "Track your response times, sentiment trends, review volume, and team performance across every platform. See what's working, spot issues early, and export reports in one click.",
  },
];

export function WhatIsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            What Is SocialRep
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            One platform to manage your entire online reputation
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every comment, DM, review, and mention from every platform you use — pulled into one inbox, analyzed by AI, and ready for you to respond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {columns.map((col, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-primary mb-4">
                <col.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{col.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{col.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
