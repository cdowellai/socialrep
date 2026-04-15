import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SparklineProps {
  data: number[];
  color?: string;
}

function MicroSparkline({ data, color = "hsl(var(--primary))" }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 48;
  const h = 20;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface KPICardProps {
  variant?: "metric" | "onboarding";
  // Metric variant
  title?: string;
  value?: string | number;
  trend?: { value: number; isPositive?: boolean };
  sparklineData?: number[];
  onClick?: () => void;
  // Onboarding variant
  onboardingTitle?: string;
  onboardingDescription?: string;
  onboardingCta?: string;
  onboardingIcon?: LucideIcon;
  onboardingGradient?: string;
  onCtaClick?: () => void;
}

export function KPICard({
  variant = "metric",
  title,
  value,
  trend,
  sparklineData,
  onClick,
  onboardingTitle,
  onboardingDescription,
  onboardingCta,
  onboardingIcon: OnboardingIcon,
  onboardingGradient = "from-primary/10 to-primary/5",
  onCtaClick,
}: KPICardProps) {
  if (variant === "onboarding" && OnboardingIcon) {
    return (
      <button onClick={onCtaClick} className="text-left w-full group h-full">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col",
          "bg-gradient-to-br", onboardingGradient
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex flex-col flex-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <OnboardingIcon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-semibold tracking-tight">{onboardingTitle}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">{onboardingDescription}</p>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
              {onboardingCta}
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Metric variant
  const hasTrend = trend !== undefined && !isNaN(trend.value) && trend.value !== 0;
  const trendIsUp = hasTrend && trend.value > 0;
  const trendIsDown = hasTrend && trend.value < 0;
  const isPositiveDirection = trend?.isPositive ?? true;
  const trendIsGood = (trendIsUp && isPositiveDirection) || (trendIsDown && !isPositiveDirection);
  const trendIsBad = (trendIsUp && !isPositiveDirection) || (trendIsDown && isPositiveDirection);

  const TrendIcon = trendIsUp ? TrendingUp : TrendingDown;
  const trendColorClass = trendIsGood
    ? "text-sentiment-positive"
    : trendIsBad
    ? "text-sentiment-negative"
    : "text-muted-foreground";

  return (
    <button onClick={onClick} className="text-left w-full group h-full">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-bold tracking-tight leading-none">{value}</p>
            {sparklineData && sparklineData.length > 1 && (
              <MicroSparkline data={sparklineData} />
            )}
          </div>
          {hasTrend && (
            <div className={cn("flex items-center gap-1 text-xs font-medium mt-3", trendColorClass)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend.value).toFixed(0)}% vs last week</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
