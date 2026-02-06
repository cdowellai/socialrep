import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings } from "lucide-react";
import type { PlatformBreakdown } from "@/hooks/useAnalytics";

interface ResponsePerformanceChartProps {
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

export function ResponsePerformanceChart({
  platformBreakdown,
  loading,
}: ResponsePerformanceChartProps) {
  const [goalHours, setGoalHours] = useState<number>(2);
  const [tempGoal, setTempGoal] = useState<string>("2");

  const chartData = useMemo(() => {
    if (!platformBreakdown) return [];

    return platformBreakdown
      .filter((p) => p.totalInteractions > 0)
      .map((p) => ({
        platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
        responseTime: p.avgResponseTimeHours,
        responseRate: p.responseRate,
        color: PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.other,
      }))
      .sort((a, b) => b.responseTime - a.responseTime);
  }, [platformBreakdown]);

  const handleGoalChange = () => {
    const parsed = parseFloat(tempGoal);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalHours(parsed);
    }
  };

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
        <CardTitle className="text-lg">Response Performance by Platform</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Goal: {goalHours}h
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <Label htmlFor="goal">Response Time Goal (hours)</Label>
              <div className="flex gap-2">
                <Input
                  id="goal"
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  min="0.5"
                  step="0.5"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleGoalChange}>
                  Set
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A reference line will appear at this value
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="platform"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  label={{ 
                    value: 'Hours', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  domain={[0, 100]}
                  label={{ 
                    value: 'Rate %', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "responseTime") return [`${value}h`, "Avg Response Time"];
                    if (name === "responseRate") return [`${value}%`, "Response Rate"];
                    return [value, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => {
                    if (value === "responseTime") return "Avg Response Time";
                    if (value === "responseRate") return "Response Rate";
                    return value;
                  }}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={goalHours}
                  stroke="hsl(var(--sentiment-positive))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Goal: ${goalHours}h`,
                    position: "right",
                    fill: "hsl(var(--sentiment-positive))",
                    fontSize: 11,
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="responseTime"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="responseTime"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="responseRate"
                  stroke="hsl(var(--sentiment-positive))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--sentiment-positive))", r: 4 }}
                  name="responseRate"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
