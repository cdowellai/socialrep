import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ease = [0.16, 1, 0.3, 1] as const;

const faqs = [
  { q: "Does the AI actually sound like me?", a: "Yes — because you train it. You describe your brand voice, paste real responses you've written, and the AI uses those as its baseline. Every draft matches your tone. Nothing sends without your approval." },
  { q: "What if the AI writes something I don't like?", a: "Every AI response is a draft. You can edit, approve, or discard it. For automated responses like 5-star review replies, you write the templates and set the rules." },
  { q: "Which platforms are supported?", a: "We support Facebook, Instagram, Google Business, Yelp, and Trustpilot with full two-way integration. Additional platforms including TikTok, YouTube, LinkedIn, and BBB are being expanded regularly." },
  { q: "Can I manage multiple clients?", a: "Yes. Professional supports team collaboration. Agency includes separate workspaces, white-label reports, and 15 team seats — built for agencies." },
  { q: "How long does setup take?", a: "About 15 minutes. Connect platforms (2 min each), train your AI voice (5 min), and you're live. Your inbox populates immediately." },
  { q: "How is this different from Hootsuite?", a: "Hootsuite is for publishing. SocialRep is for responding — managing the other side of social media. AI-drafted responses in your voice, sentiment analytics, and reputation tracking." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no fees. Cancel in one click. Annual plans keep access through the billing period." },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative py-20 bg-[#06060a] overflow-hidden">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="text-center mb-16"
        >
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.08] tracking-[-0.03em] font-extrabold text-white">
            Common questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-white/[0.06]">
                <AccordionTrigger className="text-left font-semibold text-[15px] hover:no-underline py-6 text-white/80 hover:text-white transition-colors duration-300">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] text-white/55 leading-[1.7] pb-6">
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
