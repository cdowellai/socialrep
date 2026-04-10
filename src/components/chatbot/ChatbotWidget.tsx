import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
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

const quickActions = [
  "What do you offer?",
  "How does pricing work?",
  "I need help with my account",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-[6px] h-[6px] rounded-full bg-muted-foreground/40"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
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

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current && !showPreChatForm && view === "chat") {
      inputRef.current.focus();
    }
  }, [isOpen, showPreChatForm, view]);

  // Switch to chat view when messages arrive
  useEffect(() => {
    if (messages.length > 0) setView("chat");
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollDown(!atBottom);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      setView("chat");
      sendMessage(inputValue.trim());
      setInputValue("");
      // Reset textarea height
      if (inputRef.current) inputRef.current.style.height = "auto";
    }
  };

  const handleQuickAction = (text: string) => {
    setView("chat");
    sendMessage(text);
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
    // Auto-resize
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const needsPreChatForm = showPreChatForm && !visitorInfo && (collectName || collectEmail);
  const positionClasses = position === "bottom-right" ? "right-4" : "left-4";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  const accentColor = primaryColor || "hsl(var(--primary))";

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
              className="h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              <MessageSquare className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {(isOpen || isPreview) && (
          <motion.div
            initial={isPreview ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "w-[400px] rounded-2xl shadow-2xl border border-border/50 bg-card overflow-hidden flex flex-col",
              isPreview ? "w-full h-[600px]" : "h-[580px]"
            )}
          >
            {/* Header */}
            <div
              className="relative px-5 pt-5 pb-4 text-white flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)" }} />
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] leading-tight">{title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[11px] text-white/70">Typically replies instantly</span>
                    </div>
                  </div>
                </div>
                {!isPreview && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-white/80" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
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
              /* Home View */
              <div className="flex-1 overflow-auto">
                <div className="p-5">
                  <h2 className="text-xl font-bold tracking-tight mt-1">{greeting} 👋</h2>
                  <p className="text-sm text-muted-foreground mt-1">How can we help you today?</p>
                </div>

                {/* Welcome message card */}
                <div className="px-5 mb-4">
                  <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Assistant</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{welcomeMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="px-5 pb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">Popular questions</p>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all text-sm flex items-center justify-between group"
                      >
                        <span>{action}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat View */
              <div className="flex-1 flex flex-col min-h-0">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-5 py-4"
                >
                  {/* Welcome message */}
                  <div className="flex gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: accentColor }}>
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-md bg-muted/60 px-3.5 py-2.5 text-sm">
                        {welcomeMessage}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={cn("flex gap-2.5 mb-3", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.role === "assistant" && (
                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: accentColor }}>
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn("max-w-[80%]", message.role === "user" && "order-1")}>
                        <div
                          className={cn(
                            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                            message.role === "user"
                              ? "rounded-tr-md text-white"
                              : "rounded-tl-md bg-muted/60"
                          )}
                          style={message.role === "user" ? { backgroundColor: accentColor } : undefined}
                        >
                          {message.role === "assistant" ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                              <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                        {/* Timestamp on last message of a group */}
                        {(index === messages.length - 1 || messages[index + 1]?.role !== message.role) && (
                          <p className={cn("text-[10px] text-muted-foreground/60 mt-1 px-1", message.role === "user" && "text-right")}>
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-2.5 mb-3"
                      >
                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: accentColor }}>
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3">
                          <TypingIndicator />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                  {showScrollDown && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center z-10"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Input Area */}
            {!needsPreChatForm && (
              <div className="flex-shrink-0 border-t border-border/50 p-3 bg-card">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 resize-none bg-muted/50 border-0 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50 max-h-[120px]"
                  />
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!inputValue.trim() || isLoading}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                      inputValue.trim() && !isLoading
                        ? "text-white shadow-sm hover:opacity-90 active:scale-95"
                        : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                    )}
                    style={inputValue.trim() && !isLoading ? { backgroundColor: accentColor } : undefined}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
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
