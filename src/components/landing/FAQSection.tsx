import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Does the AI actually sound like me, or like a generic chatbot?",
    answer: "It sounds like you — because you train it. You describe your brand voice, paste a few real responses you've sent before, and the AI uses those as its baseline. Every draft matches your tone and style. And nothing sends without your approval.",
  },
  {
    question: "What happens if the AI writes something I don't like?",
    answer: "You're always in control. Every AI response starts as a draft in your inbox — you can edit it, approve it, or throw it away. For automated responses (like auto-replying to 5-star reviews), you write the templates and set the rules yourself.",
  },
  {
    question: "Which platforms does SocialRep connect to?",
    answer: "Full two-way integration with Facebook Pages, Instagram, Google Business Profile, Yelp, and Trustpilot. Monitoring is available for TikTok, YouTube, LinkedIn, and BBB, with full integration rolling out. New platforms are added regularly.",
  },
  {
    question: "Can I manage multiple clients from one account?",
    answer: "That's exactly what the Agency plan is for. You get a separate workspace for each client, white-label reports with your own branding, 15 team seats with role-based permissions, and one-click switching between client dashboards.",
  },
  {
    question: "How long does it take to set up?",
    answer: "About 15 minutes. Connect your platform accounts (2 minutes each), train the AI on your brand voice (5 minutes), and you're live. The Smart Inbox starts populating immediately.",
  },
  {
    question: "How is this different from Hootsuite or Sprout Social?",
    answer: "Hootsuite and Sprout are publishing and scheduling tools that added basic listening. SocialRep is purpose-built for reputation management — the respond-and-resolve workflow. Our AI doesn't just flag a message, it drafts a response in your voice. Our analytics track response times and sentiment, not just impressions. And plans start at $79/mo.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. No contracts, no cancellation fees. Cancel from your billing settings in one click. If you're on an annual plan, you keep access through the end of your billing period.",
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Questions? Answered.
          </h2>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-200",
                      openIndex === index && "rotate-180"
                    )} 
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    openIndex === index ? "max-h-96" : "max-h-0"
                  )}
                >
                  <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
