import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Does the AI actually sound like me, or like a generic chatbot?",
    a: "It sounds like you — because you train it. You describe your brand voice, paste a few real responses you've sent before, and the AI uses those as its baseline. Every draft matches your tone and style. And nothing sends without your approval.",
  },
  {
    q: "What happens if the AI writes something I don't like?",
    a: "You're always in control. Every AI response starts as a draft in your inbox — you can edit it, approve it, or throw it away. For automated responses (like auto-replying to 5-star reviews), you write the templates and set the rules yourself.",
  },
  {
    q: "Which platforms does SocialRep connect to?",
    a: "Full two-way integration with Facebook Pages, Instagram, Google Business Profile, Yelp, and Trustpilot. Monitoring is available for TikTok, YouTube, LinkedIn, and BBB, with full integration rolling out. New platforms are added regularly.",
  },
  {
    q: "Can I manage multiple accounts or clients?",
    a: "Yes. The Professional plan supports team collaboration and the Agency plan includes separate workspaces, white-label reports, and 15 team seats — built for managing multiple accounts from one dashboard.",
  },
  {
    q: "How long does it take to set up?",
    a: "About 15 minutes. Connect your platform accounts (2 minutes each), train the AI on your brand voice (5 minutes), and you're live. The Smart Inbox starts populating immediately.",
  },
  {
    q: "How is this different from Hootsuite or Sprout Social?",
    a: "Those are publishing and scheduling tools that added basic listening features. SocialRep is built from the ground up for the other side of social — responding to customers and managing your reputation. Our AI drafts responses in your voice, our analytics track response times and sentiment, and plans start at $79/mo.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Cancel from your billing settings in one click. If you're on an annual plan, you keep access through the end of your billing period.",
  },
];

export function FAQSection() {
  return (
    <section className="py-28 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-display-sm md:text-display-md">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
