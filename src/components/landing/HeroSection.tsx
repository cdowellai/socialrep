import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, MoreHorizontal, RefreshCw, LayoutDashboard, Inbox, Layers, Star as StarIcon, Users, BarChart3, Bot, Settings, MessageSquare } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

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
      <section className="relative min-h-screen bg-[#06060a] overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />
        
        {/* Ambient orbs - more diffuse */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-[#4338ca]/[0.05] blur-[200px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/6 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/[0.03] blur-[150px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/6 w-[400px] h-[400px] rounded-full bg-[#2563eb]/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-36 md:pt-44 pb-24 relative z-10">
          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <div className="flex -space-x-1.5">
                {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-[#06060a]" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-[12px] text-white/40 font-medium">
                Trusted by 2,400+ businesses
              </span>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease }}
            className="text-center mb-7"
          >
            <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] font-extrabold tracking-[-0.04em] text-white">
              Every message.
              <br />
              <span className="bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
                One inbox.
              </span>
              <br />
              <span className="text-white/90">AI that sounds like&nbsp;you.</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
            className="text-center text-white/35 text-lg md:text-[20px] max-w-[600px] mx-auto mb-12 leading-[1.65] font-light"
          >
            Comments, DMs, and reviews from every platform — one inbox.
            AI drafts on-brand replies. You approve in one click.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="flex flex-col items-center gap-5 mb-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={handleScrollToPricing}
                className="group h-[52px] px-9 rounded-full bg-white text-[#06060a] font-semibold text-[15px] hover:bg-white/95 transition-all duration-500 hover:shadow-[0_0_60px_-8px_rgba(255,255,255,0.25)] flex items-center gap-2.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
                className="h-[52px] px-7 rounded-full border border-white/[0.1] text-white/60 font-medium text-[15px] hover:border-white/20 hover:text-white/80 transition-all duration-500"
              >
                See how it works
              </button>
            </div>
            <p className="text-[12px] text-white/20 tracking-wide">
              14-day free trial · No credit card required
            </p>
          </motion.div>

          {/* Product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.6, ease }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            {/* Glow */}
            <div className="absolute -inset-8 bg-gradient-to-b from-[#4338ca]/15 via-[#4338ca]/5 to-transparent rounded-[32px] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#4338ca]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden bg-[#0c0c14] shadow-[0_40px_120px_-30px_rgba(67,56,202,0.2),0_0_0_1px_rgba(255,255,255,0.03)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.015] border-b border-white/[0.05]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/[0.04] rounded-lg px-4 py-1.5 text-[11px] text-white/20 border border-white/[0.04] min-w-[200px] text-center">
                    app.socialrep.ai
                  </div>
                </div>
                <div className="w-16" />
              </div>

              {/* App */}
              <div className="flex" style={{ minHeight: 440 }}>
                {/* Sidebar */}
                <div className="hidden md:flex flex-col items-center w-[56px] border-r border-white/[0.05] bg-white/[0.01] py-4 gap-1">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center mb-4 shadow-[0_0_20px_-4px_rgba(99,102,241,0.4)]">
                    <MessageSquare className="h-3.5 w-3.5 text-white" />
                  </div>
                  {sidebarItems.map((item, i) => (
                    <div
                      key={i}
                      className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg cursor-default transition-all duration-300 ${item.active ? "bg-white/[0.06] text-white" : "text-white/20 hover:text-white/35"}`}
                    >
                      <item.icon className="h-[14px] w-[14px]" />
                      <span className="text-[7px] mt-0.5 leading-none font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-[#4338ca] to-[#6366f1] text-white text-[7px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg text-white/15">
                      <Settings className="h-[14px] w-[14px]" />
                    </div>
                  </div>
                </div>

                {/* List */}
                <div className="w-full md:w-[32%] border-r border-white/[0.05] flex flex-col">
                  <div className="p-3 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 text-[11px] text-white/20 border border-white/[0.03]">
                      <Search className="h-3.5 w-3.5" />
                      <span>Search conversations...</span>
                    </div>
                  </div>
                  <div className="flex gap-4 px-4 pt-3 pb-2 text-[11px]">
                    <span className="font-semibold text-white border-b-2 border-[#818cf8] pb-1.5">All (47)</span>
                    <span className="text-white/25 pb-1.5">Pending (12)</span>
                    <span className="text-white/25 pb-1.5">Urgent (3)</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {conversations.map((conv, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2.5 px-3 py-2.5 cursor-default border-l-2 transition-all duration-300 ${conv.selected ? "border-l-[#818cf8] bg-white/[0.04]" : "border-l-transparent hover:bg-white/[0.02]"}`}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold shadow-lg"
                          style={{ backgroundColor: conv.color }}
                        >
                          {conv.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-white/80 truncate">{conv.name}</span>
                            <span className="text-[9px] text-white/15">· {conv.platform}</span>
                          </div>
                          <p className="text-[10px] text-white/25 truncate mt-0.5">{conv.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] text-white/12">{conv.time}</span>
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
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: "#8b5cf6" }}>SD</div>
                      <div>
                        <span className="font-semibold text-[13px] text-white/85">@sarah_designs</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/35">Instagram</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Positive</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-white/15">
                      <span className="text-[9px] px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-white/10 transition-colors cursor-default">Assign</span>
                      <Star className="h-3.5 w-3.5" />
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.01] border-b border-white/[0.04] text-[9px] text-white/15">
                    <span>First interaction</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                    <span>Instagram follower</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                    <span>Miami, FL</span>
                  </div>

                  <div className="flex-1 px-5 py-5 space-y-4 overflow-hidden">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: "#8b5cf6" }}>SD</div>
                      <div>
                        <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-4 py-2.5 text-[12px] text-white/55 max-w-sm leading-relaxed">
                          Love this product! Do you ship to Miami? ✨
                        </div>
                        <span className="text-[8px] text-white/12 mt-1.5 block">Today at 2:14 PM</span>
                      </div>
                    </div>

                    <div className="border border-[#818cf8]/15 rounded-2xl bg-gradient-to-br from-[#818cf8]/[0.04] to-[#c084fc]/[0.02] p-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#818cf8] to-[#a78bfa] flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">✦</span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#a78bfa]">AI-Generated Draft</span>
                        </div>
                        <span className="text-[8px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/25 border border-white/[0.04]">Brand voice: Friendly</span>
                      </div>
                      <p className="text-[12px] leading-[1.7] mb-4 text-white/45">
                        Hi Sarah! Thank you so much 💛 Yes, we ship to Miami — usually arrives in 3-5 business days. Want me to send you a direct link to order?
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="text-[11px] px-4 py-2 rounded-lg bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white font-semibold shadow-[0_0_16px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] transition-shadow">Send Response</button>
                        <button className="text-[11px] px-4 py-2 rounded-lg border border-white/[0.08] text-white/40 font-medium hover:border-white/15 transition-colors">Edit</button>
                        <button className="text-[11px] px-3 py-2 text-white/20 font-medium flex items-center gap-1.5 hover:text-white/35 transition-colors">
                          <RefreshCw className="h-3 w-3" />
                          Regen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection effect */}
            <div className="absolute -bottom-px left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-[#818cf8]/30 to-transparent" />
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#06060a] pointer-events-none" />
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}
