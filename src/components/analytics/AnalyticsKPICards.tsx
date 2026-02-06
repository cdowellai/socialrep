import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Clock,
  CheckCircle2,
  ThumbsUp,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary } from "@/hooks/useAnalytics";

interface AnalyticsKPICardsProps {
  summary: AnalyticsSummary | null;
  loading?: boolean;
}

interface KPICardData {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: typeof MessageSquare;
  iconBg: string;
  iconColor: string;
  invertChange?: boolean; // For metrics where lower is better
}

export function AnalyticsKPICards({ summary, loading }: AnalyticsKPICardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const formatSentimentScore = (score: number) => {
    // Convert -1 to +1 scale to percentage (0-100)
    const percentage = Math.round((score + 1) * 50);
    return `${percentage}%`;
  };

  const cards: KPICardData[] = [
    {
      title: "Total Interactions",
      value: summary.totalInteractions.toLocaleString(),
      change: summary.totalInteractionsChange,
      changeLabel: "vs previous period",
      icon: MessageSquare,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Avg Response Time",
      value: formatResponseTime(summary.avgResponseTimeHours),
      change: summary.avgResponseTimeChange,
      changeLabel: "vs previous period",
      icon: Clock,
      iconBg: "bg-sentiment-neutral/10",
      iconColor: "text-sentiment-neutral",
      invertChange: true, // Lower is better
    },
    {
      title: "Response Rate",
      value: `${summary.responseRate}%`,
      change: summary.responseRateChange,
      changeLabel: "vs previous period",
      icon: CheckCircle2,
      iconBg: "bg-sentiment-positive/10",
      iconColor: "text-sentiment-positive",
    },
    {
      title: "Sentiment Score",
      value: formatSentimentScore(summary.avgSentimentScore),
      change: summary.avgSentimentScoreChange,
      changeLabel: "vs previous period",
      icon: ThumbsUp,
      iconBg: "bg-accent",
      iconColor: "text-accent-foreground",
    },
    {
      title: "Reviews Received",
      value: summary.totalReviews.toString(),
      change: summary.totalReviewsChange,
      changeLabel: `${summary.avgRating}/5 avg rating`,
      icon: Star,
      iconBg: "bg-sentiment-neutral/10",
      iconColor: "text-sentiment-neutral",
    },
    {
      title: "Leads Generated",
      value: summary.totalLeads.toString(),
      change: summary.totalLeadsChange,
      changeLabel: "from social interactions",
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const isPositiveChange = card.invertChange 
          ? card.change < 0 
          : card.change > 0;
        const isNegativeChange = card.invertChange 
          ? card.change > 0 
          : card.change < 0;
        const TrendIcon = card.change > 0 
          ? TrendingUp 
          : card.change < 0 
          ? TrendingDown 
          : Minus;

        return (
          <Card key={index} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", card.iconBg)}>
                  <card.icon className={cn("h-5 w-5", card.iconColor)} />
                </div>
                {card.change !== 0 && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      isPositiveChange && "text-sentiment-positive",
                      isNegativeChange && "text-sentiment-negative",
                      !isPositiveChange && !isNegativeChange && "text-muted-foreground"
                    )}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
                    <span>{Math.abs(card.change)}%</span>
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.changeLabel}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
