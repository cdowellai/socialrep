import { useState, useCallback, useEffect, useRef } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Search, Star, MoreHorizontal, RefreshCw, Zap, LayoutDashboard, Inbox, Layers, Star as StarIcon, Users, BarChart3, Bot, Settings, MessageSquare, Send, TrendingUp, Clock, MessageCircle, Instagram } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

interface Conversation {
  name: string;
  platform: string;
  platformColor: string;
  message: string;
  time: string;
  initials: string;
  color: string;
  customerContext: string;
  location: string;
  aiDraft: string;
  aiDraftAlt: string;
  sentiment: "positive" | "negative" | "neutral";
}

const conversations: Conversation[] = [
  {
    name: "Rachel Kim",
    platform: "Instagram",
    platformColor: "#E4405F",
    message: "Hey — do you guys ship to Vancouver?",
    time: "2m",
    initials: "RK",
    color: "#8b5cf6",
    customerContext: "New customer",
    location: "Vancouver, BC",
    aiDraft: "Hi Rachel — yes, we ship across Canada! Vancouver orders usually arrive within 3–5 business days. Want me to send you a tracking link once it's out?",
    aiDraftAlt: "Hey Rachel! Absolutely — we deliver to Vancouver. Most orders arrive in 3–5 days. Let me know if you'd like to place an order and I'll make sure it's prioritized!",
    sentiment: "neutral",
  },
  {
    name: "Tom Nguyen",
    platform: "Google",
    platformColor: "#ea4335",
    message: "Order #4821 still hasn't arrived. It's been 9 days.",
    time: "14m",
    initials: "TN",
    color: "#ef4444",
    customerContext: "Repeat buyer",
    location: "Toronto, ON",
    aiDraft: "Hi Tom, I'm really sorry about the delay on order #4821. I've flagged this with our logistics team and we'll have a status update for you within the hour. If it's lost in transit, we'll reship immediately at no cost.",
    aiDraftAlt: "Tom — sincerest apologies for the delay. I've escalated order #4821 and will personally follow up today. If the package doesn't arrive by tomorrow, we'll send a replacement right away.",
    sentiment: "negative",
  },
  {
    name: "Priya Sharma",
    platform: "Google",
    platformColor: "#ea4335",
    message: "Honestly impressed. Packaging was beautiful too.",
    time: "1h",
    initials: "PS",
    color: "#10b981",
    customerContext: "Loyal customer",
    location: "Montreal, QC",
    aiDraft: "Thank you so much, Priya! We put a lot of thought into the unboxing experience — so glad it showed. Would you be open to sharing a photo? We'd love to feature it!",
    aiDraftAlt: "Priya, that means the world to us! Our team obsesses over every detail, packaging included. If you'd like, we'd love to repost your experience — just tag us!",
    sentiment: "positive",
  },
  {
    name: "Jordan Ellis",
    platform: "Facebook",
    platformColor: "#1877F2",
    message: "This isn't what I ordered — can someone help?",
    time: "2h",
    initials: "JE",
    color: "#3b82f6",
    customerContext: "First purchase",
    location: "Calgary, AB",
    aiDraft: "Hi Jordan — I'm sorry about the mix-up! Could you share your order number and a photo of what you received? We'll get the correct item shipped to you today, no return needed.",
    aiDraftAlt: "Jordan, that's on us and I apologize. Please DM us your order number and we'll have the right item on its way within 24 hours — you can keep the incorrect one.",
    sentiment: "negative",
  },
];

interface ConversationState {
  draftText: string;
  isEditing: boolean;
  isSent: boolean;
  isTyping: boolean;
  isAlt: boolean;
  replies: string[];
}

type ActiveView = "inbox" | "dashboard" | "streams" | "reviews";

const sidebarItems: { icon: typeof LayoutDashboard; label: string; view: ActiveView | null; badge?: string }[] = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: Inbox, label: "Inbox", view: "inbox", badge: "12" },
  { icon: Layers, label: "Streams", view: "streams" },
  { icon: StarIcon, label: "Reviews", view: "reviews" },
  { icon: Users, label: "Leads", view: null },
  { icon: BarChart3, label: "Analytics", view: null },
  { icon: Bot, label: "Chatbot", view: null },
];

export function HeroSection() {
  const [activeView, setActiveView] = useState<ActiveView>("inbox");
  const [authModal, setAuthModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [convStates, setConvStates] = useState<Record<number, ConversationState>>(() => {
    const initial: Record<number, ConversationState> = {};
    conversations.forEach((c, i) => {
      initial[i] = { draftText: c.aiDraft, isEditing: false, isSent: false, isTyping: false, isAlt: false, replies: [] };
    });
    return initial;
  });
  const [replyText, setReplyText] = useState("");
  const editRef = useRef<HTMLTextAreaElement>(null);

  const conv = conversations[selectedIndex];
  const state = convStates[selectedIndex];

  const updateState = useCallback((idx: number, patch: Partial<ConversationState>) => {
    setConvStates(prev => ({ ...prev, [idx]: { ...prev[idx], ...patch } }));
  }, []);

  const handleSelectConversation = useCallback((idx: number) => {
    if (idx === selectedIndex) return;
    // Trigger typing animation
    updateState(idx, { isTyping: true });
    setSelectedIndex(idx);
    setReplyText("");
    setTimeout(() => {
      updateState(idx, { isTyping: false });
    }, 800);
  }, [selectedIndex, updateState]);

  const handleApproveAndSend = useCallback(() => {
    updateState(selectedIndex, { isSent: true, isEditing: false });
    setTimeout(() => {
      updateState(selectedIndex, { isSent: false });
    }, 2500);
  }, [selectedIndex, updateState]);

  const handleEdit = useCallback(() => {
    updateState(selectedIndex, { isEditing: true });
    setTimeout(() => editRef.current?.focus(), 50);
  }, [selectedIndex, updateState]);

  const handleSaveEdit = useCallback(() => {
    updateState(selectedIndex, { isEditing: false });
  }, [selectedIndex, updateState]);

  const handleRegenerate = useCallback(() => {
    const c = conversations[selectedIndex];
    const s = convStates[selectedIndex];
    updateState(selectedIndex, { isTyping: true });
    setTimeout(() => {
      updateState(selectedIndex, {
        isTyping: false,
        draftText: s.isAlt ? c.aiDraft : c.aiDraftAlt,
        isAlt: !s.isAlt,
      });
    }, 800);
  }, [selectedIndex, convStates, updateState]);

  const handleSendReply = useCallback(() => {
    if (!replyText.trim()) return;
    updateState(selectedIndex, { replies: [...state.replies, replyText.trim()] });
    setReplyText("");
  }, [selectedIndex, state, replyText, updateState]);

  const handleScrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  // Typing shimmer keyframes via inline style
  const shimmerStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.08) 40%, rgba(129,140,248,0.15) 50%, rgba(129,140,248,0.08) 60%, transparent 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer-slide 0.8s ease-in-out infinite",
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes sent-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>
      <section className="relative min-h-screen bg-[#06060a] overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-[#4338ca]/[0.05] blur-[200px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/6 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/[0.03] blur-[150px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/6 w-[400px] h-[400px] rounded-full bg-[#2563eb]/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-16 relative z-10">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease }}
            className="text-center mb-7"
          >
            <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] font-extrabold tracking-[-0.04em] text-white">
              Your reputation.
              <br />
              <span className="bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
                Always on.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
            className="text-center text-white/55 text-lg md:text-[20px] max-w-[540px] mx-auto mb-12 leading-[1.65] font-light"
          >
            One intelligent inbox that responds in your voice — so you never lose another customer.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="flex flex-col items-center gap-5 mb-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <button
                onClick={handleScrollToPricing}
                className="group h-[52px] px-9 rounded-full bg-white text-[#06060a] font-semibold text-[15px] hover:bg-white/95 transition-all duration-500 hover:shadow-[0_0_60px_-8px_rgba(255,255,255,0.25)] flex items-center gap-2.5 whitespace-nowrap"
              >
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-white/50 font-medium text-[15px] hover:text-white/80 transition-colors duration-400"
              >
                Learn more →
              </button>
            </div>
          </motion.div>

          {/* Interactive Product Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.8, delay: 0.6, ease }}
            className="mt-16 relative max-w-5xl mx-auto"
            style={{ perspective: "2000px" }}
          >
            {/* Glow layers */}
            <div className="absolute -inset-12 bg-gradient-to-b from-[#4338ca]/20 via-[#4338ca]/5 to-transparent rounded-[40px] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-[#818cf8]/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -inset-px bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent rounded-2xl pointer-events-none" />

            <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0c0c14] shadow-[0_60px_140px_-30px_rgba(67,56,202,0.25),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {/* macOS title bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border-b border-white/[0.06]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/[0.04] rounded-lg px-4 py-1.5 text-[11px] text-white/30 border border-white/[0.04] min-w-[220px] text-center flex items-center justify-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-[2px] bg-emerald-400" />
                    </div>
                    app.socialrep.ai
                  </div>
                </div>
                <div className="w-16" />
              </div>

              {/* App UI */}
              <div className="flex" style={{ minHeight: 460 }}>
                {/* Sidebar */}
                <div className="hidden md:flex flex-col items-center w-[58px] border-r border-white/[0.05] bg-gradient-to-b from-white/[0.015] to-transparent py-4 gap-1">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center mb-5 shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)]">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  {sidebarItems.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => item.view && setActiveView(item.view)}
                      className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                        item.view ? "cursor-pointer" : "cursor-default"
                      } ${item.view === activeView ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-white/30 hover:text-white/45"}`}
                    >
                      <item.icon className="h-[14px] w-[14px]" />
                      <span className="text-[7px] mt-0.5 leading-none font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-[#4338ca] to-[#6366f1] text-white text-[7px] flex items-center justify-center font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl text-white/20">
                      <Settings className="h-[14px] w-[14px]" />
                    </div>
                  </div>
                </div>

                {/* Conversation list */}
                <div className="hidden md:flex w-[32%] border-r border-white/[0.05] flex-col bg-gradient-to-b from-white/[0.01] to-transparent">
                  <div className="p-3 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2.5 text-[11px] text-white/30 border border-white/[0.04]">
                      <Search className="h-3.5 w-3.5" />
                      <span>Search conversations...</span>
                    </div>
                  </div>
                  <div className="flex gap-4 px-4 pt-3 pb-2 text-[11px]">
                    <span className="font-semibold text-white border-b-2 border-[#818cf8] pb-1.5">All (47)</span>
                    <span className="text-white/35 pb-1.5">Pending (12)</span>
                    <span className="text-white/35 pb-1.5">Urgent (3)</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {conversations.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectConversation(i)}
                        className={`flex items-start gap-2.5 px-3 py-3 cursor-pointer border-l-2 transition-all duration-300 ${
                          i === selectedIndex
                            ? "border-l-[#818cf8] bg-[#818cf8]/[0.06]"
                            : "border-l-transparent hover:bg-white/[0.02]"
                        } ${convStates[i]?.isSent ? "opacity-50" : ""}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold shadow-lg ring-1 ring-white/10"
                          style={{ backgroundColor: c.color }}
                        >
                          {c.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-white/85 truncate">{c.name}</span>
                            <span className="text-[9px] text-white/25">· {c.platform}</span>
                            {convStates[i]?.isSent && (
                              <Check className="h-3 w-3 text-emerald-400 ml-auto flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-white/35 truncate mt-0.5">{c.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] text-white/20">{c.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile-only AI draft card */}
                <MobileView
                  conv={conv}
                  state={state}
                  shimmerStyle={shimmerStyle}
                  onApprove={handleApproveAndSend}
                  onEdit={handleEdit}
                  onSaveEdit={handleSaveEdit}
                  onRegenerate={handleRegenerate}
                  onDraftChange={(text) => updateState(selectedIndex, { draftText: text })}
                  editRef={editRef}
                />

                {/* Detail panel — desktop */}
                <div className="hidden md:flex flex-col flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedIndex}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col flex-1"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.01] to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2" style={{ backgroundColor: conv.color, boxShadow: `0 0 0 2px ${conv.color}30` }}>
                            {conv.initials}
                          </div>
                          <div>
                            <span className="font-semibold text-[13px] text-white/90">{conv.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${conv.platformColor}15`, color: `${conv.platformColor}cc`, borderColor: `${conv.platformColor}20` }}>
                                {conv.platform}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-white/25">
                          <span className="text-[9px] px-2.5 py-1 rounded-lg border border-white/[0.08] hover:border-white/12 transition-colors cursor-default">Assign</span>
                          <Star className="h-3.5 w-3.5" />
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {/* Customer context bar */}
                      <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.01] border-b border-white/[0.04] text-[9px] text-white/25">
                        <span>{conv.customerContext}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/15" />
                        <span>{conv.location}</span>
                        <span className="ml-auto text-emerald-400/60">● Online</span>
                      </div>

                      <div className="flex-1 px-5 py-5 space-y-4 overflow-hidden">
                        {/* Customer message */}
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold ring-1 ring-white/10" style={{ backgroundColor: conv.color }}>
                            {conv.initials}
                          </div>
                          <div>
                            <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-4 py-3 text-[12px] text-white/65 max-w-sm leading-relaxed border border-white/[0.03]">
                              {conv.message}
                            </div>
                            <span className="text-[8px] text-white/20 mt-1.5 block">Today at 2:14 PM</span>
                          </div>
                        </div>

                        {/* User replies */}
                        {state.replies.map((reply, ri) => (
                          <div key={ri} className="flex gap-3 justify-end">
                            <div>
                              <div className="bg-[#818cf8]/10 rounded-2xl rounded-tr-md px-4 py-3 text-[12px] text-white/70 max-w-sm leading-relaxed border border-[#818cf8]/10">
                                {reply}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* AI Draft */}
                        <div className={`border rounded-2xl p-4 transition-all duration-500 ${
                          state.isSent
                            ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                            : "border-[#818cf8]/15 bg-gradient-to-br from-[#818cf8]/[0.05] via-[#818cf8]/[0.02] to-transparent shadow-[0_0_40px_-12px_rgba(99,102,241,0.1)]"
                        }`}
                          style={state.isSent ? { animation: "sent-pulse 0.6s ease-out" } : {}}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-[0_0_12px_-2px_rgba(129,140,248,0.4)] ${
                                state.isSent ? "bg-gradient-to-br from-emerald-500 to-emerald-400" : "bg-gradient-to-br from-[#818cf8] to-[#a78bfa]"
                              }`}>
                                <span className="text-[9px] text-white font-bold">{state.isSent ? "✓" : "✦"}</span>
                              </div>
                              <span className={`text-[11px] font-semibold ${state.isSent ? "text-emerald-400" : "text-[#a78bfa]"}`}>
                                {state.isSent ? "Response Sent" : "AI-Generated Draft"}
                              </span>
                            </div>
                            {!state.isSent && (
                              <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Ready to send</span>
                            )}
                          </div>

                          {state.isTyping ? (
                            <div className="space-y-2 mb-4">
                              <div className="h-3 rounded-full w-[90%]" style={shimmerStyle} />
                              <div className="h-3 rounded-full w-[75%]" style={shimmerStyle} />
                              <div className="h-3 rounded-full w-[60%]" style={shimmerStyle} />
                            </div>
                          ) : state.isEditing ? (
                            <textarea
                              ref={editRef}
                              value={state.draftText}
                              onChange={(e) => updateState(selectedIndex, { draftText: e.target.value })}
                              className="w-full text-[12px] leading-[1.75] mb-4 text-white/55 bg-transparent border border-white/[0.08] rounded-xl p-3 resize-none focus:outline-none focus:border-[#818cf8]/30"
                              rows={3}
                            />
                          ) : (
                            <p className="text-[12px] leading-[1.75] mb-4 text-white/55">
                              {state.draftText}
                            </p>
                          )}

                          {!state.isSent && !state.isTyping && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleApproveAndSend}
                                className="text-[11px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white font-semibold shadow-[0_0_16px_-4px_rgba(99,102,241,0.4)] flex items-center gap-1.5 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.6)] transition-shadow cursor-pointer"
                              >
                                <Check className="h-3 w-3" /> Approve & Send
                              </button>
                              {state.isEditing ? (
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-[11px] px-3 py-2 rounded-xl border border-[#818cf8]/20 text-[#818cf8]/70 font-medium cursor-pointer hover:border-[#818cf8]/40 transition-colors"
                                >
                                  Done
                                </button>
                              ) : (
                                <button
                                  onClick={handleEdit}
                                  className="text-[11px] px-3 py-2 rounded-xl border border-white/[0.06] text-white/40 font-medium cursor-pointer hover:border-white/[0.12] hover:text-white/60 transition-all"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={handleRegenerate}
                                className="text-[11px] px-3 py-2 rounded-xl text-white/30 font-medium flex items-center gap-1 cursor-pointer hover:text-white/50 transition-colors"
                              >
                                <RefreshCw className="h-3 w-3" /> Regenerate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reply bar */}
                      <div className="px-5 py-3 border-t border-white/[0.05] bg-gradient-to-r from-white/[0.01] to-transparent">
                        <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.05] focus-within:border-white/[0.1] transition-colors">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                            placeholder="Write a reply..."
                            className="text-[12px] text-white/70 placeholder:text-white/25 flex-1 bg-transparent outline-none"
                          />
                          <div className="flex items-center gap-2">
                            {replyText.trim() ? (
                              <button
                                onClick={handleSendReply}
                                className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#4338ca] to-[#6366f1] flex items-center justify-center text-white cursor-pointer hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-shadow"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/25 border border-white/[0.04]">
                                <Zap className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Fade-to-black mask */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#06060a] via-[#06060a]/80 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultTab="signup" />
    </>
  );
}

/* Mobile view extracted for clarity */
function MobileView({
  conv, state, shimmerStyle, onApprove, onEdit, onSaveEdit, onRegenerate, onDraftChange, editRef,
}: {
  conv: Conversation;
  state: ConversationState;
  shimmerStyle: React.CSSProperties;
  onApprove: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onRegenerate: () => void;
  onDraftChange: (text: string) => void;
  editRef: React.RefObject<HTMLTextAreaElement>;
}) {
  return (
    <div className="flex md:hidden flex-col flex-1 px-4 py-4 space-y-3">
      {/* Customer message */}
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold ring-1 ring-white/10" style={{ backgroundColor: conv.color }}>{conv.initials}</div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-white/85">{conv.name}</span>
            <span className="text-[9px] text-white/25">· {conv.platform}</span>
          </div>
          <div className="bg-white/[0.04] rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[12px] text-white/65 leading-relaxed border border-white/[0.03]">
            {conv.message}
          </div>
        </div>
      </div>

      {/* AI Draft */}
      <div className={`border rounded-2xl p-3.5 transition-all duration-500 ${
        state.isSent
          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
          : "border-[#818cf8]/15 bg-gradient-to-br from-[#818cf8]/[0.05] via-[#818cf8]/[0.02] to-transparent shadow-[0_0_40px_-12px_rgba(99,102,241,0.1)]"
      }`}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${state.isSent ? "bg-gradient-to-br from-emerald-500 to-emerald-400" : "bg-gradient-to-br from-[#818cf8] to-[#a78bfa]"}`}>
            <span className="text-[9px] text-white font-bold">{state.isSent ? "✓" : "✦"}</span>
          </div>
          <span className={`text-[11px] font-semibold ${state.isSent ? "text-emerald-400" : "text-[#a78bfa]"}`}>
            {state.isSent ? "Response Sent" : "AI-Generated Draft"}
          </span>
          {!state.isSent && (
            <span className="ml-auto text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Ready to send</span>
          )}
        </div>

        {state.isTyping ? (
          <div className="space-y-2 mb-3">
            <div className="h-3 rounded-full w-[90%]" style={shimmerStyle} />
            <div className="h-3 rounded-full w-[70%]" style={shimmerStyle} />
          </div>
        ) : state.isEditing ? (
          <textarea
            ref={editRef}
            value={state.draftText}
            onChange={(e) => onDraftChange(e.target.value)}
            className="w-full text-[12px] leading-[1.75] mb-3 text-white/55 bg-transparent border border-white/[0.08] rounded-xl p-3 resize-none focus:outline-none focus:border-[#818cf8]/30"
            rows={3}
          />
        ) : (
          <p className="text-[12px] leading-[1.75] mb-3 text-white/55">{state.draftText}</p>
        )}

        {!state.isSent && !state.isTyping && (
          <div className="flex items-center gap-2">
            <button onClick={onApprove} className="text-[11px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#4338ca] to-[#6366f1] text-white font-semibold flex items-center gap-1.5 cursor-pointer">
              <Check className="h-3 w-3" /> Approve & Send
            </button>
            <button onClick={state.isEditing ? onSaveEdit : onEdit} className="text-[11px] px-3 py-2 rounded-xl border border-white/[0.06] text-white/40 font-medium cursor-pointer">
              {state.isEditing ? "Done" : "Edit"}
            </button>
            <button onClick={onRegenerate} className="text-[11px] px-3 py-2 rounded-xl text-white/30 font-medium flex items-center gap-1 cursor-pointer">
              <RefreshCw className="h-3 w-3" /> Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
