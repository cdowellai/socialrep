import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onClick?: () => void;
  trend?: {
    value: number; // percentage change
    isPositive?: boolean; // whether up is good (default true)
  };
}

export function KPICard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  onClick,
  trend,
}: KPICardProps) {
  const hasTrend = trend !== undefined && !isNaN(trend.value);
  const trendIsUp = hasTrend && trend.value > 0;
  const trendIsDown = hasTrend && trend.value < 0;
  const trendIsNeutral = hasTrend && trend.value === 0;
  
  // Determine if the trend is "good" or "bad"
  // By default, up is good. But for things like "Pending Messages", up might be bad
  const isPositiveDirection = trend?.isPositive ?? true;
  const trendIsGood = (trendIsUp && isPositiveDirection) || (trendIsDown && !isPositiveDirection);
  const trendIsBad = (trendIsUp && !isPositiveDirection) || (trendIsDown && isPositiveDirection);

  const TrendIcon = trendIsUp ? TrendingUp : trendIsDown ? TrendingDown : Minus;
  
  const trendColorClass = trendIsGood 
    ? "text-sentiment-positive" 
    : trendIsBad 
    ? "text-sentiment-negative" 
    : "text-muted-foreground";

  return (
    <button
      onClick={onClick}
      className="text-left w-full"
    >
      <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", bgColor)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
            
            {hasTrend && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", trendColorClass)}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>{Math.abs(trend.value).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
