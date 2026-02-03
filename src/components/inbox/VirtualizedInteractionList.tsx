import { useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;
type Sentiment = Enums<"sentiment_type">;
type Status = Enums<"interaction_status">;
type Platform = Enums<"interaction_platform">;

interface VirtualizedInteractionListProps {
  interactions: Interaction[];
  selectedInteractionId: string | null;
  selectedIds: Set<string>;
  onSelect: (interaction: Interaction) => void;
  onToggleCheck: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

const platformColors: Record<Platform, string> = {
  instagram: "bg-platform-instagram",
  facebook: "bg-platform-facebook",
  twitter: "bg-platform-twitter",
  google: "bg-platform-google",
  linkedin: "bg-platform-linkedin",
  yelp: "bg-yellow-500",
  tripadvisor: "bg-green-600",
  other: "bg-gray-500",
};

const sentimentIcons: Record<Sentiment, typeof ThumbsUp> = {
  positive: ThumbsUp,
  neutral: Minus,
  negative: ThumbsDown,
};

const statusIcons: Record<Status, typeof Clock> = {
  pending: Clock,
  responded: CheckCircle2,
  escalated: AlertCircle,
  archived: Archive,
};

const getSentimentColor = (sentiment: Sentiment | null) => {
  switch (sentiment) {
    case "positive":
      return "text-sentiment-positive bg-sentiment-positive/10";
    case "negative":
      return "text-sentiment-negative bg-sentiment-negative/10";
    default:
      return "text-sentiment-neutral bg-sentiment-neutral/10";
  }
};

const getStatusColor = (status: Status | null) => {
  switch (status) {
    case "pending":
      return "text-sentiment-neutral bg-sentiment-neutral/10";
    case "responded":
      return "text-sentiment-positive bg-sentiment-positive/10";
    case "escalated":
      return "text-sentiment-negative bg-sentiment-negative/10";
    default:
      return "text-muted-foreground bg-muted";
  }
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

export function VirtualizedInteractionList({
  interactions,
  selectedInteractionId,
  selectedIds,
  onSelect,
  onToggleCheck,
  onLoadMore,
  hasMore,
  loadingMore,
}: VirtualizedInteractionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: interactions.length + (hasMore ? 1 : 0), // +1 for loading indicator
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96, // Estimated row height
    overscan: 10, // Render 10 extra items above/below viewport for smoother scrolling
  });

  // Load more when scrolling near bottom
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= interactions.length - 5 &&
      hasMore &&
      !loadingMore
    ) {
      onLoadMore();
    }
  }, [
    hasMore,
    loadingMore,
    interactions.length,
    onLoadMore,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-auto"
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= interactions.length;

          if (isLoaderRow) {
            return (
              <div
                key="loader"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center justify-center"
              >
                {loadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Scroll to load more...
                  </span>
                )}
              </div>
            );
          }

          const interaction = interactions[virtualRow.index];
          const SentimentIcon = sentimentIcons[interaction.sentiment || "neutral"];
          const StatusIcon = statusIcons[interaction.status || "pending"];
          const isSelected = selectedInteractionId === interaction.id;
          const isChecked = selectedIds.has(interaction.id);

          return (
            <div
              key={interaction.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-2 py-1"
            >
              <div
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all h-full flex gap-3",
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted/50 border-border"
                )}
                onClick={() => onSelect(interaction)}
              >
                <div
                  className="pt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck(interaction.id);
                  }}
                >
                  <Checkbox checked={isChecked} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", platformColors[interaction.platform])}
                    >
                      {interaction.platform}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getSentimentColor(interaction.sentiment))}
                    >
                      <SentimentIcon className="h-3 w-3 mr-1" />
                      {interaction.sentiment || "neutral"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getStatusColor(interaction.status))}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {interaction.status || "pending"}
                    </Badge>
                  </div>

                  <p className="text-sm font-medium truncate">
                    {interaction.author_name || interaction.author_handle || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {interaction.content}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(interaction.created_at)}
                    </span>
                    {(interaction.urgency_score || 0) >= 7 && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!hasMore && interactions.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-2">
          All {interactions.length} interactions loaded
        </p>
      )}
    </div>
  );
}
