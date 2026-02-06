import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { PlatformBreakdown } from "@/hooks/useAnalytics";

interface PlatformBreakdownChartProps {
  platformBreakdown: PlatformBreakdown[] | null;
  loading?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  tiktok: "#000000",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  google: "#4285F4",
  yelp: "#D32323",
  tripadvisor: "#34E0A1",
  trustpilot: "#00B67A",
  other: "#6B7280",
};

export function PlatformBreakdownChart({
  platformBreakdown,
  loading,
}: PlatformBreakdownChartProps) {
  const chartData = useMemo(() => {
    if (!platformBreakdown) return [];

    return platformBreakdown
      .filter((p) => p.totalInteractions > 0)
      .map((p) => ({
        platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
        platformKey: p.platform,
        interactions: p.totalInteractions,
        responseRate: p.responseRate,
        sentiment: Math.round((p.avgSentiment + 1) * 50), // Convert -1 to +1 to 0-100
        responseTime: p.avgResponseTimeHours,
        color: PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.other,
      }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [platformBreakdown]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                dataKey="platform"
                type="category"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={70}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{data.platform}</p>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Interactions:</span>
                          <span className="font-medium">{data.interactions}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Response Rate:</span>
                          <span className="font-medium">{data.responseRate}%</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Sentiment:</span>
                          <span className="font-medium">{data.sentiment}%</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Avg Response:</span>
                          <span className="font-medium">{data.responseTime}h</span>
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="interactions"
                radius={[0, 4, 4, 0]}
                name="Interactions"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          {chartData.slice(0, 4).map((platform) => (
            <div key={platform.platformKey} className="text-center">
              <div
                className="inline-block w-3 h-3 rounded-full mb-1"
                style={{ backgroundColor: platform.color }}
              />
              <p className="text-sm font-medium">{platform.platform}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {platform.responseRate}% resp
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    platform.sentiment >= 60
                      ? "text-sentiment-positive border-sentiment-positive"
                      : platform.sentiment >= 40
                      ? "text-sentiment-neutral border-sentiment-neutral"
                      : "text-sentiment-negative border-sentiment-negative"
                  }`}
                >
                  {platform.sentiment}% sent
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
