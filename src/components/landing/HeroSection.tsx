import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, MoreHorizontal, RefreshCw, LayoutDashboard, Inbox, Layers, Star as StarIcon, Users, BarChart3, Bot, Settings, MessageSquare } from "lucide-react";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const handleScrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const conversations = [
    { name: "@sarah_designs", platform: "Instagram", message: "Love this product! Do you ship to Miami? ✨", time: "2m ago", tag: "Positive", tagClass: "bg-sentiment-positive text-primary-foreground", selected: true, initials: "SD", color: "hsl(280, 70%, 60%)" },
    { name: "Mike Thompson", platform: "Google", message: "Still waiting on my order from last week...", time: "14m ago", tag: "Urgent", tagClass: "bg-sentiment-negative text-primary-foreground", selected: false, initials: "MT", color: "hsl(12, 83%, 55%)" },
    { name: "Alex Chen", platform: "Google", message: "Outstanding service and quick delivery!", time: "1h ago", tag: "★★★★★", tagClass: "bg-sentiment-neutral text-primary-foreground", selected: false, initials: "AC", color: "hsl(160, 70%, 45%)" },
    { name: "Jen Rivera", platform: "Facebook", message: "Can I get a refund? Not what I expected.", time: "2h ago", tag: "AI Ready", tagClass: "bg-primary text-primary-foreground", selected: false, initials: "JR", color: "hsl(221, 44%, 41%)" },
    { name: "Marcus W.", platform: "Yelp", message: "The food was great but parking is terrible", time: "3h ago", tag: "New", tagClass: "bg-secondary text-secondary-foreground", selected: false, initials: "MW", color: "hsl(38, 92%, 50%)" },
    { name: "@coffeelover99", platform: "Instagram", message: "Is this available in a larger size?", time: "5h ago", tag: "Pending", tagClass: "bg-muted text-muted-foreground", selected: false, initials: "CL", color: "hsl(330, 72%, 52%)" },
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: false },
    { icon: Inbox, label: "Inbox", active: true, badge: "12" },
    { icon: Layers, label: "Streams", active: false },
    { icon: StarIcon, label: "Reviews", active: false },
    { icon: Users, label: "Leads", active: false },
    { icon: BarChart3, label: "Analytics", active: false },
    { icon: Bot, label: "Chatbot", active: false },
  ];

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center pt-28 md:pt-36 pb-20 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl mb-6">
              Every message.{" "}
              <span className="text-gradient">One inbox.</span>
              <br />
              AI that sounds like you.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              SocialRep pulls your comments, messages, and reviews from every platform into one intelligent inbox — then drafts on-brand responses you approve and send in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button variant="hero" size="xl" onClick={handleScrollToPricing}>
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              14-day free trial · Cancel anytime
            </p>
          </motion.div>

          {/* Product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto"
          >
            <div className="rounded-2xl shadow-2xl border border-border/60 overflow-hidden bg-card">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-foreground/10" />
                  <div className="w-3 h-3 rounded-full bg-foreground/10" />
                  <div className="w-3 h-3 rounded-full bg-foreground/10" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/80 rounded-lg px-4 py-1.5 text-xs text-muted-foreground border border-border/40">
                    app.socialrep.ai/inbox
                  </div>
                </div>
                <div className="w-12" />
              </div>

              {/* App layout */}
              <div className="flex bg-background" style={{ minHeight: 420 }}>
                {/* Sidebar */}
                <div className="hidden md:flex flex-col items-center w-16 border-r border-border/60 bg-muted/20 py-4 gap-1">
                  <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center mb-4">
                    <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  {sidebarItems.map((item, i) => (
                    <div
                      key={i}
                      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl cursor-default transition-colors ${item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-[9px] mt-0.5 leading-none">{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      <span className="text-[9px] mt-0.5 leading-none">Settings</span>
                    </div>
                  </div>
                </div>

                {/* Conversation list */}
                <div className="w-full md:w-[30%] border-r border-border/60 flex flex-col">
                  <div className="p-3 border-b border-border/60">
                    <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2 text-xs text-muted-foreground">
                      <Search className="h-3 w-3" />
                      <span>Search conversations...</span>
                    </div>
                  </div>
                  <div className="flex gap-3 px-3 pt-3 pb-2 text-xs">
                    <span className="font-medium text-foreground border-b-2 border-primary pb-1">All (47)</span>
                    <span className="text-muted-foreground">Pending (12)</span>
                    <span className="text-muted-foreground">Urgent (3)</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {conversations.map((conv, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2.5 px-3 py-2.5 cursor-default border-l-2 transition-colors ${conv.selected ? "border-l-primary bg-accent/40" : "border-l-transparent"}`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground text-[10px] font-bold"
                          style={{ backgroundColor: conv.color }}
                        >
                          {conv.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground truncate">{conv.name}</span>
                            <span className="text-[9px] text-muted-foreground">· {conv.platform}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{conv.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] text-muted-foreground">{conv.time}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${conv.tagClass}`}>
                            {conv.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail */}
                <div className="hidden md:flex flex-col flex-1">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">@sarah_designs</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">Instagram</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sentiment-positive text-primary-foreground font-medium">Positive</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[10px] px-2 py-0.5 rounded-lg border border-border/60 cursor-default">Assign</span>
                      <Star className="h-3.5 w-3.5" />
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-5 py-2 bg-muted/20 border-b border-border/60 text-[10px] text-muted-foreground">
                    <span>First interaction</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>Instagram follower</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>Miami, FL</span>
                  </div>

                  <div className="flex-1 px-5 py-4 space-y-4 overflow-hidden">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground text-[10px] font-bold" style={{ backgroundColor: "hsl(280, 70%, 60%)" }}>
                        SD
                      </div>
                      <div>
                        <div className="bg-muted/40 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-xs max-w-sm">
                          Love this product! Do you ship to Miami? ✨
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 block">Today at 2:14 PM</span>
                      </div>
                    </div>

                    <div className="border border-primary/20 rounded-2xl bg-accent/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-primary">✦ AI-Generated Draft</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">Brand voice: Friendly</span>
                      </div>
                      <p className="text-xs leading-relaxed mb-3 text-foreground/80">
                        Hi Sarah! Thank you so much 💛 Yes, we ship to Miami — usually arrives in 3-5 business days. Want me to send you a direct link to order?
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="text-[11px] px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">Send Response</button>
                        <button className="text-[11px] px-3.5 py-1.5 rounded-lg border border-border/60 font-medium">Edit</button>
                        <button className="text-[11px] px-2 py-1.5 text-muted-foreground font-medium flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
