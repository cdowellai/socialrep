import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "We were using Hootsuite for monitoring and a spreadsheet for reviews. SocialRep replaced both in a day. The AI responses actually sound like us — not like a chatbot from 2019.",
    name: "Maria K.",
    role: "Owner, Coastal Dental Group",
    initials: "MK",
    color: "bg-pink-500",
  },
  {
    quote: "I manage social for 12 restaurants. Before SocialRep, a bad review could sit for a week. Now I get flagged in minutes, AI drafts a response, and I approve. Response time went from 3 days to 2 hours.",
    name: "James T.",
    role: "Director, Fork & Flame Digital",
    initials: "JT",
    color: "bg-blue-500",
  },
  {
    quote: "The reports alone justify the cost. My clients used to ask 'what are we paying you for?' Now I send a PDF every Monday showing exactly what we handled and the sentiment shift.",
    name: "Rachel D.",
    role: "Founder, Bright Social Agency",
    initials: "RD",
    color: "bg-emerald-500",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-primary mb-3">
            From real beta users
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            They tried everything else first
          </h2>
          <p className="text-muted-foreground text-lg">
            Here's what early users say after switching to SocialRep.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-sm font-medium text-white`}>
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
