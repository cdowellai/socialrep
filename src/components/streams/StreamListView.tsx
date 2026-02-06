import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Archive,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamCardAssignDropdown } from "./StreamCardAssignDropdown";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;
type Sentiment = Enums<"sentiment_type">;
type Status = Enums<"interaction_status">;
type Platform = Enums<"interaction_platform">;

interface StreamListViewProps {
  interactions: Interaction[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onInteractionClick?: (interaction: Interaction) => void;
  onAssign?: (interactionId: string, userId: string | null) => void;
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

const sentimentColors: Record<Sentiment, string> = {
  positive: "bg-sentiment-positive",
  neutral: "bg-sentiment-neutral",
  negative: "bg-sentiment-negative",
};

const statusIcons: Record<Status, typeof Clock> = {
  pending: Clock,
  responded: CheckCircle2,
  escalated: AlertTriangle,
  archived: Archive,
};

const statusColors: Record<Status, string> = {
  pending: "text-muted-foreground",
  responded: "text-sentiment-positive",
  escalated: "text-sentiment-negative",
  archived: "text-muted-foreground",
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
  return `${days}d ago`;
};

export function StreamListView({
  interactions,
  selectedIds = new Set(),
  onToggleSelect,
  onInteractionClick,
  onAssign,
}: StreamListViewProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No interactions found
      </div>
    );
  }

  return (
    <div className="border rounded-lg divide-y bg-card">
      {/* Header row */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
        <div className="w-5" />
        <div>Author</div>
        <div className="w-20">Platform</div>
        <div className="w-16 text-center">Sentiment</div>
        <div className="w-24 text-center">Status</div>
        <div className="w-20 text-center">Assigned</div>
        <div className="w-20 text-right">Time</div>
      </div>

      {/* Interaction rows */}
      {interactions.map((interaction) => {
        const sentiment = interaction.sentiment || "neutral";
        const status = interaction.status || "pending";
        const StatusIcon = statusIcons[status];
        const isSelected = selectedIds.has(interaction.id);
        const isUrgent = (interaction.urgency_score || 0) >= 7;
        const assignedTo = (interaction as any).assigned_to;

        return (
          <div
            key={interaction.id}
            className={cn(
              "grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors",
              isSelected && "bg-primary/5",
              isUrgent && "bg-sentiment-negative/5"
            )}
            onClick={() => onInteractionClick?.(interaction)}
          >
            {/* Checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(interaction.id);
              }}
            >
              <Checkbox checked={isSelected} />
            </div>

            {/* Author + Content Preview */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={interaction.author_avatar || ""} />
                  <AvatarFallback className="text-xs">
                    {(interaction.author_name?.[0] || interaction.author_handle?.[0] || "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Sentiment dot */}
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                    sentimentColors[sentiment]
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {interaction.author_name || interaction.author_handle || "Unknown"}
                  </p>
                  {isUrgent && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {interaction.content}
                </p>
              </div>
            </div>

            {/* Platform */}
            <div className="w-20">
              <Badge
                variant="secondary"
                className={cn("text-[10px] text-white", platformColors[interaction.platform])}
              >
                {interaction.platform}
              </Badge>
            </div>

            {/* Sentiment */}
            <div className="w-16 flex justify-center">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  sentimentColors[sentiment]
                )}
                title={sentiment}
              />
            </div>

            {/* Status */}
            <div className="w-24">
              <Badge
                variant="outline"
                className={cn("text-[10px] capitalize", statusColors[status])}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {status}
              </Badge>
            </div>

            {/* Assigned */}
            <div
              className="w-20 flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <StreamCardAssignDropdown
                interactionId={interaction.id}
                assignedTo={assignedTo}
                onAssign={onAssign}
                compact
              />
            </div>

            {/* Time */}
            <div className="w-20 text-right text-xs text-muted-foreground">
              {formatTime(interaction.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
