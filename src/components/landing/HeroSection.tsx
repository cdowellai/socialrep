import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, MoreHorizontal, RefreshCw, LayoutDashboard, Inbox, Layers, Star as StarIcon, Users, BarChart3, Bot, Settings, MessageSquare } from "lucide-react";

export function HeroSection() {
  const [authModal, setAuthModal] = useState(false);

  const handleScrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const conversations = [
    { name: "@sarah_designs", platform: "Instagram", message: "Love this product! Do you ship to Miami? ✨", time: "2m", tag: "Positive", tagColor: "bg-emerald-500/20 text-emerald-400", selected: true, initials: "SD", color: "#8b5cf6" },
    { name: "Mike Thompson", platform: "Google", message: "Still waiting on my order from last week...", time: "14m", tag: "Urgent", tagColor: "bg-red-500/20 text-red-400", selected: false, initials: "MT", color: "#ef4444" },
    { name: "Alex Chen", platform: "Google", message: "Outstanding service and quick delivery!", time: "1h", tag: "★★★★★", tagColor: "bg-amber-500/20 text-amber-400", selected: false, initials: "AC", color: "#10b981" },
    { name: "Jen Rivera", platform: "Facebook", message: "Can I get a refund? Not what I expected.", time: "2h", tag: "AI Ready", tagColor: "bg-blue-500/20 text-blue-400", selected: false, initials: "JR", color: "#3b82f6" },
    { name: "Marcus W.", platform: "Yelp", message: "The food was great but parking is terrible", time: "3h", tag: "New", tagColor: "bg-white/10 text-white/50", selected: false, initials: "MW", color: "#f59e0b" },
    { name: "@coffeelover99", platform: "Instagram", message: "Is this available in a larger size?", time: "5h", tag: "Pending", tagColor: "bg-white/5 text-white/40", selected: false, initials: "CL", color: "#ec4899" },
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
      {/* Dark hero section */}
      <section className="relative min-h-screen bg-[#08080d] overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#4338ca]/[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#7c3aed]/[0.06] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#2563eb]/[0.05] blur-[80px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-32 md:pt-40 pb-20 relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[13px] text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now in public beta
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-6"
          >
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-white">
              Every message.
              <br />
              <span className="bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
                One inbox.
              </span>
              <br />
              AI that sounds like you.
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-center text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Pull your comments, messages, and reviews from every platform into one inbox.
            AI drafts on-brand responses. You approve and send in one click.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4 mb-6"
          >
            <button
              onClick={handleScrollToPricing}
              className="group h-12 px-8 rounded-full bg-white text-[#0a0a0f] font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-[13px] text-white/30">
              14-day free trial · No credit card · Cancel anytime
            </p>
          </motion.div>

          {/* Product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 relative"
          >
            {/* Glow behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-b from-[#4338ca]/20 via-[#4338ca]/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0f0f17] shadow-[0_20px_80px_-20px_rgba(67,56,202,0.25)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/[0.04] rounded-md px-3 py-1 text-[11px] text-white/25 border border-white/[0.04]">
                    app.socialrep.ai/inbox
                  </div>
                </div>
                <div className="w-12" />
              </div>

              {/* App */}
              <div className="flex" style={{ minHeight: 400 }}>
                {/* Sidebar */}
                <div className="hidden md:flex flex-col items-center w-14 border-r border-white/[0.06] bg-white/[0.01] py-3 gap-0.5">
                  <div className="h-6 w-6 rounded-md bg-[#4338ca] flex items-center justify-center mb-3">
                    <MessageSquare className="h-3 w-3 text-white" />
                  </div>
                  {sidebarItems.map((item, i) => (
                    <div
                      key={i}
                      className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg cursor-default transition-colors ${item.active ? "bg-white/[0.06] text-white" : "text-white/25 hover:text-white/40"}`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="text-[8px] mt-0.5 leading-none">{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#4338ca] text-white text-[7px] flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg text-white/20">
                      <Settings className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* List */}
                <div className="w-full md:w-[30%] border-r border-white/[0.06] flex flex-col">
                  <div className="p-2.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-1.5 text-[11px] text-white/20">
                      <Search className="h-3 w-3" />
                      <span>Search...</span>
                    </div>
                  </div>
                  <div className="flex gap-3 px-3 pt-2.5 pb-2 text-[11px]">
                    <span className="font-medium text-white border-b border-[#818cf8] pb-1">All (47)</span>
                    <span className="text-white/25">Pending (12)</span>
                    <span className="text-white/25">Urgent (3)</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {conversations.map((conv, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 px-3 py-2 cursor-default border-l-2 transition-colors ${conv.selected ? "border-l-[#818cf8] bg-white/[0.04]" : "border-l-transparent"}`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: conv.color }}
                        >
                          {conv.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold text-white/80 truncate">{conv.name}</span>
                            <span className="text-[9px] text-white/20">· {conv.platform}</span>
                          </div>
                          <p className="text-[10px] text-white/30 truncate">{conv.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span className="text-[9px] text-white/15">{conv.time}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${conv.tagColor}`}>
                            {conv.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail */}
                <div className="hidden md:flex flex-col flex-1">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13px] text-white/80">@sarah_designs</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">Instagram</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Positive</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/20">
                      <span className="text-[9px] px-2 py-0.5 rounded border border-white/[0.06]">Assign</span>
                      <Star className="h-3 w-3" />
                      <MoreHorizontal className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-1.5 bg-white/[0.01] border-b border-white/[0.06] text-[9px] text-white/20">
                    <span>First interaction</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                    <span>Instagram follower</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                    <span>Miami, FL</span>
                  </div>

                  <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: "#8b5cf6" }}>SD</div>
                      <div>
                        <div className="bg-white/[0.04] rounded-xl rounded-tl-sm px-3 py-2 text-[11px] text-white/60 max-w-xs">
                          Love this product! Do you ship to Miami? ✨
                        </div>
                        <span className="text-[8px] text-white/15 mt-1 block">Today at 2:14 PM</span>
                      </div>
                    </div>

                    <div className="border border-[#818cf8]/20 rounded-xl bg-[#818cf8]/[0.04] p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-[#a78bfa]">✦ AI-Generated Draft</span>
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/30">Brand voice: Friendly</span>
                      </div>
                      <p className="text-[11px] leading-relaxed mb-3 text-white/50">
                        Hi Sarah! Thank you so much 💛 Yes, we ship to Miami — usually arrives in 3-5 business days. Want me to send you a direct link to order?
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#4338ca] text-white font-medium">Send Response</button>
                        <button className="text-[10px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/50 font-medium">Edit</button>
                        <button className="text-[10px] px-2 py-1.5 text-white/25 font-medium flex items-center gap-1">
                          <RefreshCw className="h-2.5 w-2.5" />
                          Regen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
