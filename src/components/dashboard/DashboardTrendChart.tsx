import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface DashboardTrendChartProps {
  interactions: Interaction[];
  loading?: boolean;
}

export function DashboardTrendChart({ interactions, loading }: DashboardTrendChartProps) {
  const chartData = useMemo(() => {
    // Group interactions by day for the last 7 days
    const days = 7;
    const now = new Date();
    const data: { date: string; total: number; responded: number; pending: number }[] = [];

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
        pending: dayInteractions.filter((i) => i.status === "pending").length,
      });
    }

    return data;
  }, [interactions]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Activity Trend (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResponded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorTotal)"
                strokeWidth={2}
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="responded"
                stroke="hsl(142 76% 36%)"
                fillOpacity={1}
                fill="url(#colorResponded)"
                strokeWidth={2}
                name="Responded"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sentiment-positive" />
            <span className="text-muted-foreground">Responded</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
