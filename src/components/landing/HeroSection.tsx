import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ArrowRight, Search, Star, MoreHorizontal, RefreshCw, LayoutDashboard, Inbox, Layers, Star as StarIcon, Users, BarChart3, Bot, Settings, MessageSquare } from "lucide-react";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const handleScrollToHowItWorks = () => {
    const element = document.querySelector("#how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const conversations = [
    { name: "@sarah_designs", platform: "Instagram", message: "Love this product! Do you ship to Miami? ✨", time: "2m ago", tag: "Positive", tagClass: "bg-sentiment-positive text-primary-foreground", selected: true, initials: "SD", color: "hsl(280, 70%, 60%)" },
    { name: "Mike Thompson", platform: "Google", message: "Still waiting on my order from last week...", time: "14m ago", tag: "Urgent", tagClass: "bg-sentiment-negative text-primary-foreground", selected: false, initials: "MT", color: "hsl(12, 83%, 55%)" },
    { name: "Alex Chen", platform: "Google", message: "Outstanding service and quick delivery!", time: "1h ago", tag: "★★★★★", tagClass: "bg-sentiment-neutral text-primary-foreground", selected: false, initials: "AC", color: "hsl(152, 70%, 50%)" },
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
      <section className="relative min-h-screen flex flex-col items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in leading-tight">
              Stop drowning in comments.
              <br />
              <span>Let AI respond </span>
              <span className="text-gradient">in your voice.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              SocialRep uses AI to pull your comments, messages, and reviews from every platform into one inbox — then drafts on-brand responses you can approve and send in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" onClick={() => setAuthModal(true)}>
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleScrollToHowItWorks}>
                See How It Works
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span>14-Day Free Trial</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>No Credit Card Required</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* Browser Chrome Mockup — Smart Inbox */}
          <div className="max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="rounded-xl shadow-2xl border border-border overflow-hidden bg-card">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-sentiment-negative/60" />
                  <div className="w-3 h-3 rounded-full bg-sentiment-neutral/60" />
                  <div className="w-3 h-3 rounded-full bg-sentiment-positive/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background rounded-md px-4 py-1.5 text-xs text-muted-foreground border border-border">
                    app.socialrep.ai/inbox
                  </div>
                </div>
                <div className="w-12" />
              </div>

              {/* App Content — 3 Column Layout */}
              <div className="flex bg-background" style={{ minHeight: 420 }}>
                {/* Sidebar */}
                <div className="hidden md:flex flex-col items-center w-16 border-r border-border bg-muted/30 py-4 gap-1">
                  <div className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  {sidebarItems.map((item, i) => (
                    <div
                      key={i}
                      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-lg cursor-default transition-colors ${item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
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
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      <span className="text-[9px] mt-0.5 leading-none">Settings</span>
                    </div>
                  </div>
                </div>

                {/* Conversation List */}
                <div className="w-full md:w-[30%] border-r border-border flex flex-col">
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-xs text-muted-foreground">
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
                        className={`flex items-start gap-2.5 px-3 py-2.5 cursor-default border-l-2 ${conv.selected ? "border-l-primary bg-accent/50" : "border-l-transparent hover:bg-muted/30"}`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground text-[10px] font-bold"
                          style={{ backgroundColor: conv.color }}
                        >
                          {conv.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">{conv.name}</span>
                            <span className="text-[9px] text-muted-foreground">· {conv.platform}</span>
                          </div>
                          <p className="text-[11px] text-foreground/60 truncate">{conv.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] text-muted-foreground">{conv.time}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${conv.tagClass}`}>
                            {conv.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Detail */}
                <div className="hidden md:flex flex-col flex-1">
                  {/* Detail Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">@sarah_designs</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">Instagram</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sentiment-positive text-primary-foreground font-medium">Positive</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-border cursor-default">Assign</span>
                      <Star className="h-3.5 w-3.5" />
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Context Bar */}
                  <div className="flex items-center gap-4 px-5 py-2 bg-muted/30 border-b border-border text-[10px] text-muted-foreground">
                    <span>First interaction</span>
                    <span>·</span>
                    <span>Instagram follower</span>
                    <span>·</span>
                    <span>Miami, FL</span>
                  </div>

                  {/* Thread */}
                  <div className="flex-1 px-5 py-4 space-y-4 overflow-hidden">
                    {/* Customer message */}
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground text-[10px] font-bold" style={{ backgroundColor: "hsl(280, 70%, 60%)" }}>
                        SD
                      </div>
                      <div>
                        <div className="bg-muted/50 rounded-lg rounded-tl-none px-3 py-2 text-xs max-w-sm">
                          Love this product! Do you ship to Miami? ✨
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 block">Today at 2:14 PM</span>
                      </div>
                    </div>

                    {/* AI Draft */}
                    <div className="border-2 border-dashed border-primary/40 rounded-lg bg-accent/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-primary">✦ AI-Generated Draft</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Brand voice: Friendly & Professional</span>
                      </div>
                      <p className="text-xs leading-relaxed mb-3">
                        Hi Sarah! Thank you so much 💛 Yes, we ship to Miami — usually arrives in 3-5 business days. Want me to send you a direct link to order?
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="text-[11px] px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium">Send Response</button>
                        <button className="text-[11px] px-3 py-1.5 rounded-md border border-border font-medium">Edit</button>
                        <button className="text-[11px] px-2 py-1.5 text-muted-foreground font-medium flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Regenerate
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      Response time: 2 minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
