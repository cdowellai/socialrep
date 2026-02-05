import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface InteractionReplyInputProps {
  platform: string;
  isConnected?: boolean;
  sending?: boolean;
  onSubmit: (content: string) => void;
  className?: string;
}

export function InteractionReplyInput({
  platform,
  isConnected = false,
  sending = false,
  onSubmit,
  className,
}: InteractionReplyInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() && !sending) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const platformDisplayName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const isDisabled = !isConnected;

  return (
    <div
      className={cn(
        "flex items-start gap-2 pt-2 border-t transition-colors",
        isFocused && "bg-muted/30",
        className
      )}
    >
      <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
        <AvatarImage src="" />
        <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
          {user?.email?.[0].toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  isDisabled
                    ? `Connect your ${platformDisplayName} account to reply`
                    : "Write a comment..."
                }
                disabled={isDisabled || sending}
                className={cn(
                  "min-h-[32px] max-h-[120px] resize-none text-sm py-1.5 pr-10",
                  "border-muted-foreground/20 focus:border-primary",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                rows={1}
              />
              {isDisabled && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          {isDisabled && (
            <TooltipContent>
              Connect your {platformDisplayName} account to reply
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <Button
        size="icon"
        className="h-7 w-7 flex-shrink-0 mt-0.5"
        onClick={handleSubmit}
        disabled={!content.trim() || sending || isDisabled}
      >
        {sending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
