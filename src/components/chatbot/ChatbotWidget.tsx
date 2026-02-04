import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, Loader2, Bot, User } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatbotWidgetProps {
  title?: string;
  welcomeMessage?: string;
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
  isPreview?: boolean;
}

export function ChatbotWidget({
  title = "Chat with us",
  welcomeMessage = "Hi! How can I help you today?",
  position = "bottom-right",
  primaryColor,
  isPreview = false,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(isPreview);
  const [inputValue, setInputValue] = useState("");
  const { messages, isLoading, sendMessage, clearChat } = useChatbot({
    onError: (error) => console.error("Chat error:", error),
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const displayMessages = messages.length === 0
    ? [{ id: "welcome", role: "assistant" as const, content: welcomeMessage, timestamp: new Date() }]
    : messages;

  const positionClasses = position === "bottom-right" ? "right-4" : "left-4";

  return (
    <div className={cn("fixed bottom-4 z-50", positionClasses, isPreview && "relative bottom-0 right-0 left-0")}>
      {!isOpen && !isPreview && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg"
          style={primaryColor ? { backgroundColor: primaryColor } : undefined}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {(isOpen || isPreview) && (
        <Card className={cn("w-[380px] shadow-2xl", isPreview && "w-full")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg"
            style={primaryColor ? { backgroundColor: primaryColor } : undefined}
          >
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {title}
            </CardTitle>
            {!isPreview && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                      style={message.role === "user" && primaryColor ? { backgroundColor: primaryColor } : undefined}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                style={primaryColor ? { backgroundColor: primaryColor } : undefined}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
