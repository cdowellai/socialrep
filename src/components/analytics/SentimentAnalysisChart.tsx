import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SentimentCounts, Granularity } from "@/hooks/useAnalytics";

interface SentimentTrendItem {
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentAnalysisChartProps {
  sentiment: SentimentCounts | null;
  sentimentTrend: Record<string, SentimentTrendItem> | null;
  granularity: Granularity;
  loading?: boolean;
}

const SENTIMENT_COLORS = {
  positive: "hsl(152, 76%, 43%)",
  neutral: "hsl(38, 92%, 50%)",
  negative: "hsl(0, 84%, 60%)",
};

export function SentimentAnalysisChart({
  sentiment,
  sentimentTrend,
  granularity,
  loading,
}: SentimentAnalysisChartProps) {
  const trendData = useMemo(() => {
    if (!sentimentTrend) return [];

    return Object.entries(sentimentTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: formatDateLabel(date, granularity),
        fullDate: date,
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
      }));
  }, [sentimentTrend, granularity]);

  const pieData = useMemo(() => {
    if (!sentiment) return [];

    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    if (total === 0) return [];

    return [
      {
        name: "Positive",
        value: sentiment.positive,
        percentage: Math.round((sentiment.positive / total) * 100),
        color: SENTIMENT_COLORS.positive,
      },
      {
        name: "Neutral",
        value: sentiment.neutral,
        percentage: Math.round((sentiment.neutral / total) * 100),
        color: SENTIMENT_COLORS.neutral,
      },
      {
        name: "Negative",
        value: sentiment.negative,
        percentage: Math.round((sentiment.negative / total) * 100),
        color: SENTIMENT_COLORS.negative,
      },
    ].filter((item) => item.value > 0);
  }, [sentiment]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stacked Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sentiment Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
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
                    labelFormatter={(label, payload) => {
                      if (payload?.[0]?.payload?.fullDate) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke={SENTIMENT_COLORS.positive}
                    fill={SENTIMENT_COLORS.positive}
                    fillOpacity={0.6}
                    name="Positive"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke={SENTIMENT_COLORS.neutral}
                    fill={SENTIMENT_COLORS.neutral}
                    fillOpacity={0.6}
                    name="Neutral"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke={SENTIMENT_COLORS.negative}
                    fill={SENTIMENT_COLORS.negative}
                    fillOpacity={0.6}
                    name="Negative"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donut Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} interactions`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Legend */}
          <div className="space-y-2 mt-4">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDateLabel(date: string, granularity: Granularity): string {
  const d = new Date(date);

  switch (granularity) {
    case "daily":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "weekly":
      return `W${d.toLocaleDateString("en-US", { day: "numeric" })}`;
    case "monthly":
      return d.toLocaleDateString("en-US", { month: "short" });
    default:
      return date;
  }
}
