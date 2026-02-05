import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquare,
  Archive,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Send,
  Sparkles,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
}

const platformColors: Record<Platform, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  google: "bg-red-500",
  linkedin: "bg-blue-700",
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
}: StreamCardProps) {
  const sentiment = interaction.sentiment || "neutral";
  const status = interaction.status || "pending";
  const SentimentIcon = sentimentConfig[sentiment].icon;
  const StatusIcon = statusConfig[status].icon;
  const isUrgent = (interaction.urgency_score || 0) >= 7;

  return (
    <div
      className={cn(
        "group p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer",
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReply?.(interaction)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMarkResponded?.(interaction)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Responded
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive?.(interaction)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            {interaction.post_url && (
              <DropdownMenuItem onClick={() => window.open(interaction.post_url!, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground line-clamp-3 mb-2">{interaction.content}</p>

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
        <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-primary flex-1">AI draft ready</span>
          <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
            <Send className="h-3 w-3 mr-1" />
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
