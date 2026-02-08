import { useState } from "react";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    question: "Does the AI actually sound good, or like a robot?",
    answer: "It sounds like you — because you train it. During setup, you describe your brand voice and paste a few real responses. The AI uses these as its baseline. Every draft sounds natural and on-brand. You always review before anything goes out.",
  },
  {
    question: "What if the AI says something wrong?",
    answer: "Nothing sends without your approval. Every AI response is a draft for you to review. You can edit, approve, or skip. For auto-responses, you set the rules and templates. You're always in control.",
  },
  {
    question: "Which platforms are actually supported right now?",
    answer: "Full two-way integration: Facebook Pages, Instagram, Google Business Profile, Yelp, Trustpilot. In development with monitoring available: TikTok, YouTube, LinkedIn, BBB. New integrations ship monthly.",
  },
  {
    question: "Can I use this for multiple clients as an agency?",
    answer: "Yes — the Agency plan has separate client workspaces, white-label reports, 15 team seats with roles, and one-click switching between dashboards.",
  },
  {
    question: "Is there a free trial?",
    answer: "Every plan includes 14 days free. No credit card required. Full feature access so you can test with real accounts.",
  },
  {
    question: "How is this different from Hootsuite or Sprout Social?",
    answer: "Those are publishing tools that bolted on listening. SocialRep is purpose-built for the respond-and-resolve workflow. Our AI drafts responses in your voice. Our analytics track response times and sentiment, not just impressions. And we start at $79/mo.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. No contracts, no fees. Cancel in one click from billing settings.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl">
            Questions? Answered.
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-border rounded-xl overflow-hidden bg-card"
            >
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <div className="shrink-0">
                  {openIndex === i ? (
                    <X className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
