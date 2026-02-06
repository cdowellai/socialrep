import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { TopInteraction } from "@/hooks/useAnalytics";

interface TopInteractionsListProps {
  interactions: TopInteraction[] | null;
  loading?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-[#E4405F]",
  twitter: "bg-[#1DA1F2]",
  tiktok: "bg-black",
  youtube: "bg-[#FF0000]",
  linkedin: "bg-[#0A66C2]",
  google: "bg-[#4285F4]",
  yelp: "bg-[#D32323]",
  other: "bg-gray-500",
};

const SentimentIcon = {
  positive: ThumbsUp,
  neutral: Minus,
  negative: ThumbsDown,
};

const getSentimentColor = (sentiment: string | null) => {
  switch (sentiment) {
    case "positive":
      return "text-sentiment-positive bg-sentiment-positive/10";
    case "negative":
      return "text-sentiment-negative bg-sentiment-negative/10";
    default:
      return "text-sentiment-neutral bg-sentiment-neutral/10";
  }
};

export function TopInteractionsList({
  interactions,
  loading,
}: TopInteractionsListProps) {
  const navigate = useNavigate();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleViewInInbox = (interactionId: string) => {
    navigate(`/dashboard/inbox?selected=${interactionId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!interactions || interactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-sentiment-negative" />
            Top Urgent Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p>No urgent interactions</p>
            <p className="text-sm">All interactions have been addressed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-sentiment-negative" />
          Top Urgent Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {interactions.map((interaction, index) => {
          const Icon = SentimentIcon[interaction.sentiment as keyof typeof SentimentIcon] || Minus;

          return (
            <div
              key={interaction.id}
              className="group p-4 rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        className={cn(
                          "text-xs text-white",
                          PLATFORM_COLORS[interaction.platform] || PLATFORM_COLORS.other
                        )}
                      >
                        {interaction.platform}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getSentimentColor(interaction.sentiment))}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {interaction.sentiment || "neutral"}
                      </Badge>
                      {interaction.urgencyScore >= 7 && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent ({interaction.urgencyScore}/10)
                        </Badge>
                      )}
                    </div>

                    <p className="font-medium text-sm">{interaction.authorName}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {interaction.content}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(interaction.createdAt)}
                      </span>
                      <span className="capitalize">{interaction.status || "pending"}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleViewInInbox(interaction.id)}
                >
                  View
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
