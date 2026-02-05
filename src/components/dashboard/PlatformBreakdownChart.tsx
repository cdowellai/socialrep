import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface PlatformBreakdownChartProps {
  interactions: Interaction[];
  loading?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  tiktok: "#000000",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  google: "#4285F4",
  yelp: "#D32323",
  tripadvisor: "#34E0A1",
  trustpilot: "#00B67A",
  other: "#6B7280",
};

export function PlatformBreakdownChart({ interactions, loading }: PlatformBreakdownChartProps) {
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    const platformCounts: Record<string, number> = {};

    interactions.forEach((int) => {
      const platform = int.platform || "other";
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    return Object.entries(platformCounts)
      .map(([platform, count]) => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        value: count,
        platform,
        color: PLATFORM_COLORS[platform] || PLATFORM_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [interactions]);

  const handleClick = (data: { platform: string }) => {
    // Navigate to inbox filtered by platform
    navigate(`/dashboard/inbox?platform=${data.platform}`);
  };

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

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
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
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onClick={handleClick}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
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
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
          {chartData.slice(0, 5).map((item) => (
            <button
              key={item.platform}
              onClick={() => handleClick(item)}
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium">({item.value})</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
