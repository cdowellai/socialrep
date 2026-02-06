import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;

interface LeadScoreTooltipProps {
  lead: Lead;
  size?: "sm" | "lg";
  className?: string;
}

export function LeadScoreTooltip({ lead, size = "sm", className }: LeadScoreTooltipProps) {
  const score = lead.score || 0;
  
  // Use actual score breakdown from database or generate estimated breakdown
  const scoreBreakdown = {
    engagement: (lead as any).score_engagement ?? Math.round(score * 0.3),
    sentiment: (lead as any).score_sentiment ?? Math.round(score * 0.2),
    profile: (lead as any).score_profile ?? Math.round(score * 0.2),
    recency: (lead as any).score_recency ?? Math.round(score * 0.3),
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-sentiment-positive";
    if (score >= 50) return "text-sentiment-neutral";
    return "text-sentiment-negative";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-sentiment-positive";
    if (score >= 50) return "bg-sentiment-neutral";
    return "bg-sentiment-negative";
  };

  const breakdownItems = [
    { label: "Engagement", value: scoreBreakdown.engagement, max: 30 },
    { label: "Sentiment", value: scoreBreakdown.sentiment, max: 25 },
    { label: "Profile completeness", value: scoreBreakdown.profile, max: 25 },
    { label: "Recency", value: scoreBreakdown.recency, max: 30 },
  ];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2 cursor-help", className)}>
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              getScoreBgColor(score)
            )}
          />
          <span className={cn(
            "font-medium",
            size === "lg" ? "text-2xl" : "text-sm"
          )}>
            {score}
          </span>
          <Info className={cn(
            "text-muted-foreground hover:text-foreground transition-colors",
            size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
          )} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="w-64 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Lead Score</span>
            <span className={cn("text-lg font-bold", getScoreColor(score))}>
              {score}/100
            </span>
          </div>
          <div className="space-y-2">
            {breakdownItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">+{item.value}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      getScoreBgColor((item.value / item.max) * 100)
                    )}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
