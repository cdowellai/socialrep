import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MessageSquare } from "lucide-react";

type Interaction = Tables<"interactions">;

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  tiktok: "#25F4EE",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  google: "#4285F4",
  yelp: "#D32323",
  tripadvisor: "#34E0A1",
  trustpilot: "#00B67A",
  other: "#6B7280",
};

const PLATFORM_ICONS = [
  { name: "Facebook", color: "#1877F2" },
  { name: "Instagram", color: "#E4405F" },
  { name: "Google", color: "#4285F4" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "X", color: "#6B7280" },
  { name: "TikTok", color: "#25F4EE" },
];

interface PlatformBreakdownChartProps {
  interactions: Interaction[];
  loading?: boolean;
}

export function PlatformBreakdownChart({ interactions, loading }: PlatformBreakdownChartProps) {
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    interactions.forEach((int) => {
      const p = int.platform || "other";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([platform, count]) => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        value: count,
        platform,
        color: PLATFORM_COLORS[platform] || PLATFORM_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [interactions]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);
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
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platform Breakdown</h3>
        <div className="h-[220px] flex flex-col items-center justify-center text-center">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {PLATFORM_ICONS.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center opacity-20"
                  style={{ backgroundColor: p.color + "20" }}
                >
                  <Globe className="h-4 w-4" style={{ color: p.color }} />
                </div>
                <span className="text-[10px] text-muted-foreground/40">{p.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/dashboard/settings?tab=platforms")}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Connect your first platform →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platform Breakdown</h3>
          <p className="text-xs text-muted-foreground/60 mt-1">{total} total interactions</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                onClick={(d) => navigate(`/dashboard/inbox?platform=${d.platform}`)}
                className="cursor-pointer"
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 8px 32px -4px rgba(0,0,0,0.15)",
                }}
                formatter={(value: number, name: string) => [`${value} interactions`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5">
          {chartData.slice(0, 5).map((item) => (
            <button
              key={item.platform}
              onClick={() => navigate(`/dashboard/inbox?platform=${item.platform}`)}
              className="w-full flex items-center gap-3 text-left hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors group"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">{item.name}</span>
              <span className="text-sm font-semibold">{item.value}</span>
              <span className="text-xs text-muted-foreground">{total > 0 ? `${Math.round((item.value / total) * 100)}%` : "0%"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
