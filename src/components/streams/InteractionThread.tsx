import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Clock, Wifi, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InteractionReply } from "@/hooks/useInteractionReplies";

interface InteractionThreadProps {
  replies: InteractionReply[];
  loading?: boolean;
  className?: string;
}

const statusConfig = {
  pending: { icon: Clock, label: "Sending...", color: "text-muted-foreground" },
  sent: { icon: CheckCircle2, label: "Sent", color: "text-sentiment-positive" },
  failed: { icon: AlertCircle, label: "Failed", color: "text-sentiment-negative" },
  not_connected: { icon: Wifi, label: "Saved locally", color: "text-muted-foreground" },
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export function InteractionThread({
  replies,
  loading,
  className,
}: InteractionThreadProps) {
  if (loading) {
    return (
      <div className={cn("space-y-3 pt-2 border-t", className)}>
        {[1, 2].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className={cn("pt-2 border-t text-center py-4", className)}>
        <p className="text-xs text-muted-foreground">No replies yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 pt-2 border-t", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </p>

      {replies.map((reply) => {
        const status = statusConfig[reply.platform_status];
        const StatusIcon = status.icon;
        const isInternal = reply.is_internal;

        return (
          <div
            key={reply.id}
            className={cn(
              "flex items-start gap-2 p-2 rounded-md -mx-2",
              isInternal && "bg-accent/50 border border-accent"
            )}
          >
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                {reply.user_name?.[0]?.toUpperCase() ||
                  reply.user_email?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium truncate">
                  {reply.user_name || reply.user_email || "Team Member"}
                </span>
                {isInternal && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                    <StickyNote className="h-2.5 w-2.5" />
                    Internal
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(reply.created_at)}
                </span>
                {!isInternal && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1 py-0 h-4", status.color)}
                  >
                    <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                    {status.label}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-foreground mt-0.5">{reply.content}</p>

              {reply.platform_status === "failed" && reply.platform_error && (
                <p className="text-[10px] text-sentiment-negative mt-1">
                  Error: {reply.platform_error}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
