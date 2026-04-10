import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Does the AI actually sound like me?", a: "Yes — because you train it. You describe your brand voice, paste real responses you've written, and the AI uses those as its baseline. Every draft matches your tone. Nothing sends without your approval." },
  { q: "What if the AI writes something I don't like?", a: "Every AI response is a draft. You can edit, approve, or discard it. For automated responses like 5-star review replies, you write the templates and set the rules." },
  { q: "Which platforms are supported?", a: "Full two-way integration with Facebook, Instagram, Google Business, Yelp, and Trustpilot. Monitoring for TikTok, YouTube, LinkedIn, and BBB with full integration rolling out." },
  { q: "Can I manage multiple clients?", a: "Yes. Professional supports team collaboration. Agency includes separate workspaces, white-label reports, and 15 team seats — built for agencies." },
  { q: "How long does setup take?", a: "About 15 minutes. Connect platforms (2 min each), train your AI voice (5 min), and you're live. Your inbox populates immediately." },
  { q: "How is this different from Hootsuite?", a: "Hootsuite is for publishing. SocialRep is for responding — managing the other side of social media. AI-drafted responses in your voice, sentiment analytics, and reputation tracking." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no fees. Cancel in one click. Annual plans keep access through the billing period." },
];

export function FAQSection() {
  return (
    <section className="py-32 bg-muted/20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] tracking-[-0.02em] font-extrabold">
            Questions & Answers
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/40">
                <AccordionTrigger className="text-left font-semibold text-[14px] hover:no-underline py-5 text-foreground/90">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] text-muted-foreground leading-relaxed pb-5">
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
