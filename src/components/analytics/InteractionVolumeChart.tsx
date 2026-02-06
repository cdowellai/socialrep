import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Granularity } from "@/hooks/useAnalytics";

interface InteractionVolumeChartProps {
  platformTrends: Record<string, Record<string, number>> | null;
  loading?: boolean;
  granularity: Granularity;
  onGranularityChange: (granularity: Granularity) => void;
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

export function InteractionVolumeChart({
  platformTrends,
  loading,
  granularity,
  onGranularityChange,
}: InteractionVolumeChartProps) {
  const chartData = useMemo(() => {
    if (!platformTrends) return [];

    // Get all unique platforms across all dates
    const allPlatforms = new Set<string>();
    Object.values(platformTrends).forEach((platforms) => {
      Object.keys(platforms).forEach((p) => allPlatforms.add(p));
    });

    // Convert to chart data format
    return Object.entries(platformTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, platforms]) => {
        const dataPoint: Record<string, any> = {
          date: formatDateLabel(date, granularity),
          fullDate: date,
        };
        
        allPlatforms.forEach((platform) => {
          dataPoint[platform] = platforms[platform] || 0;
        });
        
        return dataPoint;
      });
  }, [platformTrends, granularity]);

  const platforms = useMemo(() => {
    if (!platformTrends) return [];
    const allPlatforms = new Set<string>();
    Object.values(platformTrends).forEach((p) => {
      Object.keys(p).forEach((platform) => allPlatforms.add(platform));
    });
    return Array.from(allPlatforms);
  }, [platformTrends]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Interaction Volume</CardTitle>
        <ToggleGroup
          type="single"
          value={granularity}
          onValueChange={(value) => value && onGranularityChange(value as Granularity)}
          size="sm"
        >
          <ToggleGroupItem value="daily" className="text-xs">Daily</ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="text-xs">Weekly</ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="text-xs">Monthly</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <Legend 
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                {platforms.map((platform) => (
                  <Line
                    key={platform}
                    type="monotone"
                    dataKey={platform}
                    stroke={PLATFORM_COLORS[platform] || PLATFORM_COLORS.other}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name={platform}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateLabel(date: string, granularity: Granularity): string {
  const d = new Date(date);
  
  switch (granularity) {
    case "daily":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "weekly":
      return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    case "monthly":
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    default:
      return date;
  }
}
