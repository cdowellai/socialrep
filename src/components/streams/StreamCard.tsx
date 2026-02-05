import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquare,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractionActionBar } from "./InteractionActionBar";
import { InteractionReplyInput } from "./InteractionReplyInput";
import { InteractionThread } from "./InteractionThread";
import { InteractionResolutionBadge } from "./InteractionResolutionBadge";
import { useInteractionReplies } from "@/hooks/useInteractionReplies";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;
type Sentiment = Enums<"sentiment_type">;
type Status = Enums<"interaction_status">;
type Platform = Enums<"interaction_platform">;

interface StreamCardProps {
  interaction: Interaction;
  showAiSuggestions?: boolean;
  onReply?: (interaction: Interaction) => void;
  onArchive?: (interaction: Interaction) => void;
  onMarkResponded?: (interaction: Interaction) => void;
  isPlatformConnected?: boolean;
}

const platformColors: Record<Platform, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  google: "bg-red-500",
  linkedin: "bg-blue-700",
  tiktok: "bg-black",
  youtube: "bg-red-600",
  yelp: "bg-red-600",
  tripadvisor: "bg-green-600",
  trustpilot: "bg-emerald-500",
  g2: "bg-orange-500",
  capterra: "bg-blue-600",
  bbb: "bg-blue-800",
  glassdoor: "bg-green-500",
  amazon: "bg-yellow-500",
  appstore: "bg-gray-800",
  playstore: "bg-green-600",
  other: "bg-gray-500",
};

const sentimentConfig: Record<Sentiment, { icon: typeof ThumbsUp; color: string; bg: string }> = {
  positive: { icon: ThumbsUp, color: "text-sentiment-positive", bg: "bg-sentiment-positive/10" },
  neutral: { icon: Minus, color: "text-sentiment-neutral", bg: "bg-sentiment-neutral/10" },
  negative: { icon: ThumbsDown, color: "text-sentiment-negative", bg: "bg-sentiment-negative/10" },
};

const statusConfig: Record<Status, { icon: typeof Clock; color: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground" },
  responded: { icon: CheckCircle2, color: "text-sentiment-positive" },
  escalated: { icon: AlertTriangle, color: "text-sentiment-negative" },
  archived: { icon: Archive, color: "text-muted-foreground" },
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

export function StreamCard({
  interaction,
  showAiSuggestions = true,
  onReply,
  onArchive,
  onMarkResponded,
  isPlatformConnected = false,
}: StreamCardProps) {
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const {
    replies,
    loading: repliesLoading,
    sending,
    sendReply,
    resolveInteraction,
    unresolveInteraction,
  } = useInteractionReplies({
    interactionId: interaction.id,
    enabled: isThreadOpen,
  });

  const sentiment = interaction.sentiment || "neutral";
  const status = interaction.status || "pending";
  const SentimentIcon = sentimentConfig[sentiment].icon;
  const StatusIcon = statusConfig[status].icon;
  const isUrgent = (interaction.urgency_score || 0) >= 7;
  const replyCount = (interaction as any).reply_count || replies.length || 0;
  const isResolved = (interaction as any).resolved || false;
  const resolvedBy = (interaction as any).resolved_by || null;
  const resolvedAt = (interaction as any).resolved_at || null;

  const handleSendReply = useCallback(
    async (content: string) => {
      await sendReply(content, interaction.platform);
    },
    [sendReply, interaction.platform]
  );

  const handleToggleResolution = useCallback(async () => {
    if (isResolved) {
      await unresolveInteraction(interaction.id);
    } else {
      await resolveInteraction(interaction.id);
    }
  }, [isResolved, interaction.id, resolveInteraction, unresolveInteraction]);

  return (
    <div
      className={cn(
        "group p-3 rounded-lg border bg-card hover:shadow-md transition-all",
        isUrgent && "border-sentiment-negative/50 bg-sentiment-negative/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={interaction.author_avatar || ""} />
            <AvatarFallback className="text-xs">
              {(interaction.author_name?.[0] || interaction.author_handle?.[0] || "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {interaction.author_name || interaction.author_handle || "Unknown"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("px-1.5 py-0.5 rounded text-white text-[10px]", platformColors[interaction.platform])}>
                {interaction.platform}
              </span>
              <span>·</span>
              <span>{formatTime(interaction.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Resolution Badge */}
        <InteractionResolutionBadge
          resolved={isResolved}
          resolvedBy={resolvedBy}
          resolvedAt={resolvedAt}
          onToggle={handleToggleResolution}
        />
      </div>

      {/* Content */}
      <p className="text-sm text-foreground mb-2">{interaction.content}</p>

      {/* View Full Post Link */}
      {interaction.post_url && (
        <a
          href={interaction.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2"
        >
          <ExternalLink className="h-3 w-3" />
          View full post
        </a>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <Badge variant="outline" className={cn("text-[10px] px-1.5", sentimentConfig[sentiment].bg, sentimentConfig[sentiment].color)}>
          <SentimentIcon className="h-2.5 w-2.5 mr-1" />
          {sentiment}
        </Badge>
        <Badge variant="outline" className={cn("text-[10px] px-1.5", statusConfig[status].color)}>
          <StatusIcon className="h-2.5 w-2.5 mr-1" />
          {status}
        </Badge>
        {isUrgent && (
          <Badge variant="destructive" className="text-[10px] px-1.5">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
            Urgent
          </Badge>
        )}
      </div>

      {/* AI Suggestion */}
      {showAiSuggestions && status === "pending" && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-primary flex-1">AI draft ready</span>
          <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
            <MessageSquare className="h-3 w-3 mr-1" />
            Use Draft
          </Button>
        </div>
      )}

      {/* Action Bar */}
      <InteractionActionBar
        replyCount={replyCount}
        isLiked={isLiked}
        postUrl={interaction.post_url}
        onToggleLike={() => setIsLiked(!isLiked)}
        onToggleThread={() => setIsThreadOpen(!isThreadOpen)}
        onArchive={() => onArchive?.(interaction)}
        onMarkResponded={() => onMarkResponded?.(interaction)}
      />

      {/* Thread/Replies Section */}
      <Collapsible open={isThreadOpen} onOpenChange={setIsThreadOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isThreadOpen ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide comments
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {replyCount > 0
                  ? `View ${replyCount} ${replyCount === 1 ? "comment" : "comments"}`
                  : "Add a comment"}
              </>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-2">
          {/* Thread of replies */}
          {replyCount > 0 && (
            <InteractionThread
              replies={replies}
              loading={repliesLoading}
            />
          )}

          {/* Reply Input */}
          <InteractionReplyInput
            platform={interaction.platform}
            isConnected={isPlatformConnected}
            sending={sending}
            onSubmit={handleSendReply}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
