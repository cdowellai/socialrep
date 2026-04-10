import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, ChevronDown, ArrowLeft } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { PreChatForm } from "./PreChatForm";
import { motion, AnimatePresence } from "framer-motion";

interface ChatbotWidgetProps {
  title?: string;
  welcomeMessage?: string;
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
  isPreview?: boolean;
  collectName?: boolean;
  collectEmail?: boolean;
}


const teamMembers = [
  { name: "Sarah", gradient: "from-violet-400 to-indigo-500" },
  { name: "Alex", gradient: "from-emerald-400 to-teal-500" },
  { name: "Jordan", gradient: "from-amber-400 to-orange-500" },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-[5px] h-[5px] rounded-full bg-foreground/30"
          animate={{ y: [0, -3, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function TimeStamp({ date }: { date: Date }) {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMinutes < 1) return <span>Just now</span>;
  if (diffMinutes < 60) return <span>{diffMinutes}m ago</span>;
  return <span>{date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>;
}

function AvatarStack() {
  return (
    <div className="flex -space-x-2">
      {teamMembers.map((member, i) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-semibold text-white ring-2 ring-card",
            member.gradient
          )}
        >
          {member.name[0]}
        </motion.div>
      ))}
    </div>
  );
}

const easeApple = [0.16, 1, 0.3, 1] as const;

export function ChatbotWidget({
  title = "Chat with us",
  welcomeMessage = "Hi! How can I help you today?",
  position = "bottom-right",
  primaryColor,
  isPreview = false,
  collectName = false,
  collectEmail = false,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(isPreview);
  const [inputValue, setInputValue] = useState("");
  const [visitorInfo, setVisitorInfo] = useState<{ name?: string; email?: string } | null>(null);
  const [showPreChatForm, setShowPreChatForm] = useState(collectName || collectEmail);
  const [view, setView] = useState<"home" | "chat">("home");
  const [showScrollDown, setShowScrollDown] = useState(false);

  const { messages, isLoading, sendMessage, clearChat, setVisitorData } = useChatbot({
    onError: (error) => console.error("Chat error:", error),
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowPreChatForm(collectName || collectEmail);
  }, [collectName, collectEmail]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current && !showPreChatForm && view === "chat") {
      inputRef.current.focus();
    }
  }, [isOpen, showPreChatForm, view]);

  useEffect(() => {
    if (messages.length > 0) setView("chat");
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      setView("chat");
      sendMessage(inputValue.trim());
      setInputValue("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    }
  };


  const handlePreChatSubmit = (data: { name?: string; email?: string }) => {
    setVisitorInfo(data);
    setShowPreChatForm(false);
    setVisitorData(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const needsPreChatForm = showPreChatForm && !visitorInfo && (collectName || collectEmail);
  const positionClasses = position === "bottom-right" ? "right-4" : "left-4";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={cn("fixed bottom-4 z-50", positionClasses, isPreview && "relative bottom-0 right-0 left-0")}>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && !isPreview && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative h-[60px] w-[60px] rounded-full shadow-2xl flex items-center justify-center bg-primary text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Outer ring pulse */}
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "3s" }} />
              {/* Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
              </svg>
              {/* Online dot */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-card" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {(isOpen || isPreview) && (
          <motion.div
            initial={isPreview ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: easeApple }}
            className={cn(
              "rounded-[20px] shadow-2xl border border-border/40 bg-card overflow-hidden flex flex-col",
              isPreview ? "w-full h-[600px]" : "w-[380px] h-[600px]"
            )}
            style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)" }}
          >
            {/* ─── Header ─── */}
            <div className="relative flex-shrink-0 px-5 pt-4 pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {view === "chat" && (
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => { if (messages.length === 0) setView("home"); }}
                      className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors -ml-1"
                    >
                      <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                  <div>
                    <h3 className="font-semibold text-[15px] text-foreground leading-tight">{title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span className="text-[11px] text-muted-foreground">We typically reply in a few minutes</span>
                    </div>
                  </div>
                </div>
                {!isPreview && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* ─── Content ─── */}
            {needsPreChatForm ? (
              <div className="flex-1 overflow-auto">
                <PreChatForm
                  collectName={collectName}
                  collectEmail={collectEmail}
                  onSubmit={handlePreChatSubmit}
                  primaryColor={primaryColor}
                />
              </div>
            ) : view === "home" && messages.length === 0 ? (
              /* ─── Home View ─── */
              <div className="flex-1 overflow-auto">
                <div className="px-5 pt-6 pb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: easeApple }}
                  >
                    <h2 className="text-[22px] font-bold tracking-tight text-foreground">
                      {greeting} 👋
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ask us anything, or pick a topic below.
                    </p>
                  </motion.div>
                </div>

                {/* Team presence */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: easeApple }}
                  className="mx-5 mb-4 p-4 rounded-2xl bg-muted/40 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <AvatarStack />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">Our team is online</p>
                      <p className="text-[11px] text-muted-foreground">Average reply time: ~2 min</p>
                    </div>
                  </div>
                </motion.div>

                {/* Welcome message */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5, ease: easeApple }}
                  className="mx-5 mb-5 p-4 rounded-2xl bg-primary/[0.06] border border-primary/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-primary-foreground text-sm font-semibold">S</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Sarah from Support</p>
                      <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{welcomeMessage}</p>
                    </div>
                  </div>
                </motion.div>

              </div>
            ) : (
              /* ─── Chat View ─── */
              <div className="flex-1 flex flex-col min-h-0">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-5 py-4"
                >
                  {/* Welcome message in chat */}
                  <div className="flex gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-primary-foreground text-[10px] font-bold">S</span>
                    </div>
                    <div className="max-w-[80%]">
                      <p className="text-[10px] text-muted-foreground/60 mb-1 font-medium">Sarah</p>
                      <div className="rounded-2xl rounded-tl-md bg-muted/50 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground">
                        {welcomeMessage}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: easeApple }}
                      className={cn("flex gap-2.5 mb-3", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.role === "assistant" && (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <span className="text-primary-foreground text-[10px] font-bold">S</span>
                        </div>
                      )}
                      <div className={cn("max-w-[80%]", message.role === "user" && "order-1")}>
                        {message.role === "assistant" && (index === 0 || messages[index - 1]?.role !== "assistant") && (
                          <p className="text-[10px] text-muted-foreground/60 mb-1 font-medium">Sarah</p>
                        )}
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                            message.role === "user"
                              ? "rounded-tr-md bg-primary text-primary-foreground"
                              : "rounded-tl-md bg-muted/50 text-foreground"
                          )}
                        >
                          {message.role === "assistant" ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-[13px]">
                              <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                        {(index === messages.length - 1 || messages[index + 1]?.role !== message.role) && (
                          <p className={cn("text-[10px] text-muted-foreground/40 mt-1 px-1", message.role === "user" && "text-right")}>
                            <TimeStamp date={message.timestamp} />
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-2.5 mb-3"
                      >
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <span className="text-primary-foreground text-[10px] font-bold">S</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground/60 mb-1 font-medium">Sarah is typing</p>
                          <div className="rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                            <TypingIndicator />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>

                {/* Scroll to bottom */}
                <AnimatePresence>
                  {showScrollDown && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-card border border-border/50 shadow-lg flex items-center justify-center z-10"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ─── Input Area ─── */}
            {!needsPreChatForm && (
              <div className="flex-shrink-0 border-t border-border/30 p-3 bg-card/80 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message…"
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 resize-none bg-muted/40 border border-border/30 rounded-xl px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50 max-h-[120px] transition-all duration-200"
                  />
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleSubmit()}
                    disabled={!inputValue.trim() || isLoading}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
                      inputValue.trim() && !isLoading
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground/30 mt-2 select-none">
                  Powered by SocialRep
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
