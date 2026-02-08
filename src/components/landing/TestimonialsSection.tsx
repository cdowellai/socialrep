import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    avatar: "SJ",
    content:
      "SocialRep AI has completely transformed how we manage our online presence. Response time dropped from 4 hours to 15 minutes, and our customer satisfaction scores are through the roof!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Founder & CEO",
    company: "EcoGreen Products",
    avatar: "MC",
    content:
      "The AI-generated responses are incredibly on-brand. I was skeptical at first, but after training it with our brand voice, it feels like having a full-time social media team.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Customer Success Manager",
    company: "CloudServe Solutions",
    avatar: "ER",
    content:
      "We manage 15+ social accounts and hundreds of reviews daily. SocialRep AI handles 80% of interactions automatically, freeing our team to focus on complex issues.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Operations Director",
    company: "Restaurant Group",
    avatar: "DK",
    content:
      "Review management across Google, Yelp, and TripAdvisor used to be a nightmare. Now it's all in one place with AI-suggested responses. Game changer!",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Brand Manager",
    company: "Fashion Forward",
    avatar: "LT",
    content:
      "The sentiment analysis is spot-on. We catch negative mentions before they escalate, and the proactive listening feature has helped us identify trending topics to capitalize on.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Digital Marketing Lead",
    company: "AutoDealer Network",
    avatar: "JW",
    content:
      "Lead generation from social interactions was always manual. Now SocialRep AI automatically detects and syncs potential leads to our CRM. Brilliant!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by{" "}
            <span className="text-gradient">10,000+ Businesses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers are saying about SocialRep AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-sentiment-neutral text-sentiment-neutral"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
