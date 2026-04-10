import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
}

export function KPICard({ title, value, icon: Icon, color, bgColor, onClick, trend }: KPICardProps) {
  const hasTrend = trend !== undefined && !isNaN(trend.value);
  const trendIsUp = hasTrend && trend.value > 0;
  const trendIsDown = hasTrend && trend.value < 0;

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
    <button onClick={onClick} className="text-left w-full group">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer h-full">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", bgColor)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            {hasTrend && (
              <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg", trendColorClass, 
                trendIsGood ? "bg-sentiment-positive/10" : trendIsBad ? "bg-sentiment-negative/10" : "bg-muted"
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(trend.value).toFixed(0)}%</span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </div>
    </button>
  );
}
