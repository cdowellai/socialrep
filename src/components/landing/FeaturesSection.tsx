import { Check } from "lucide-react";
import { UnifiedInboxMockup } from "./mockups/UnifiedInboxMockup";
import { AIResponseMockup } from "./mockups/AIResponseMockup";
import { AnalyticsMockup } from "./mockups/AnalyticsMockup";
import { ChatbotMockup } from "./mockups/ChatbotMockup";

const features = [
  {
    number: "1",
    title: "Unified Smart Inbox",
    description: "Every comment, DM, review, and mention from every platform — in one feed. AI sorts by urgency, flags complaints, and surfaces hot leads so you handle what matters first.",
    bullets: [
      "Comments, DMs, reviews, and mentions in one view",
      "AI sentiment tagging — urgent items surface automatically",
      "Assign to team members, add internal notes, snooze",
      "Full customer history across every interaction",
    ],
    MockupComponent: UnifiedInboxMockup,
    imageLeft: false,
  },
  {
    number: "2",
    title: "AI that sounds like you, not a bot",
    description: "Train SocialRep on your brand voice — paste a few example replies, describe your tone, and every AI draft matches how you actually talk.",
    bullets: [
      "Brand voice training with your real examples",
      "One-click review responses across Google, Yelp, Facebook",
      "Auto-respond to positive reviews with custom templates",
      "Always review before sending — you stay in control",
    ],
    MockupComponent: AIResponseMockup,
    imageLeft: true,
  },
  {
    number: "3",
    title: "Reports your clients will actually read",
    description: "Track response times, sentiment trends, review volume, and team performance. Export clean PDF reports in one click.",
    bullets: [
      "Response time, sentiment, and volume trends",
      "Team performance leaderboard",
      "Platform-by-platform breakdown",
      "One-click PDF export with your branding",
    ],
    MockupComponent: AnalyticsMockup,
    imageLeft: false,
  },
  {
    number: "4",
    title: "AI chatbot that works while you sleep",
    description: "Embed a branded chatbot on your site that answers FAQs, collects leads, and hands off to your team when it can't help.",
    bullets: [
      "Custom knowledge base — FAQs, product info, policies",
      "Branded widget matching your site's look",
      "Smart handoff to human agents via Smart Inbox",
      "Pre-chat forms to capture name & email",
    ],
    MockupComponent: ChatbotMockup,
    imageLeft: true,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
            How SocialRep fixes this
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            Stop reacting. Start managing.
          </h2>
          <p className="text-muted-foreground text-lg">
            Four capabilities that replace the 6 tools you're duct-taping together.
          </p>
        </div>

        {/* Feature Rows */}
        <div className="space-y-24">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                feature.imageLeft ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Content */}
              <div className={feature.imageLeft ? "lg:order-2" : "lg:order-1"}>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-lg mb-4">
                  {feature.number}
                </div>
                <h3 className="font-display text-2xl md:text-3xl mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mockup */}
              <div className={feature.imageLeft ? "lg:order-1" : "lg:order-2"}>
                <feature.MockupComponent />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
