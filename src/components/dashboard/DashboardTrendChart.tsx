import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface DashboardTrendChartProps {
  interactions: Interaction[];
  loading?: boolean;
}

export function DashboardTrendChart({ interactions, loading }: DashboardTrendChartProps) {
  const chartData = useMemo(() => {
    const days = 7;
    const now = new Date();
    const data: { date: string; total: number; responded: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      const dayInteractions = interactions.filter((int) => {
        const intDate = new Date(int.created_at).toISOString().split("T")[0];
        return intDate === dateStr;
      });

      data.push({
        date: dayLabel,
        total: dayInteractions.length,
        responded: dayInteractions.filter((i) => i.status === "responded").length,
      });
    }
    return data;
  }, [interactions]);

  const isEmpty = interactions.length === 0;

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-8">
        <Skeleton className="h-5 w-40 mb-6" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-8">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activity Trend</h3>
        <div className="h-[220px] flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5">
            <Activity className="h-7 w-7 text-primary/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">Activity will appear here</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[220px]">Connect a platform to start tracking your interaction trends.</p>
          <Link to="/dashboard/settings?tab=platforms" className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Connect Platform <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activity Trend</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sentiment-positive" />
            <span className="text-muted-foreground">Responded</span>
          </div>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradResponded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--sentiment-positive))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--sentiment-positive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 8px 32px -4px rgba(0,0,0,0.15)",
              }}
            />
            <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#gradTotal)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="responded" stroke="hsl(var(--sentiment-positive))" fill="url(#gradResponded)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
