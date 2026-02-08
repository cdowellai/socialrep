import { TrendingDown, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Response Time", value: "1.2h", change: "↓ 74%", positive: true },
  { label: "Response Rate", value: "96%", change: "↑ 12%", positive: true },
  { label: "Avg Sentiment", value: "+0.72", change: "↑ 8%", positive: true },
];

const platformColors: Record<string, string> = {
  Facebook: "bg-[#1877F2]",
  Instagram: "bg-[#E4405F]",
  Google: "bg-[#EA4335]",
  X: "bg-foreground",
  Yelp: "bg-[#D32323]",
  LinkedIn: "bg-[#0A66C2]",
};

const chartData = [
  { platform: "Facebook", height: 80 },
  { platform: "Instagram", height: 95 },
  { platform: "Google", height: 60 },
  { platform: "X", height: 45 },
  { platform: "Yelp", height: 55 },
  { platform: "LinkedIn", height: 40 },
  { platform: "Facebook", height: 70 },
  { platform: "Instagram", height: 85 },
  { platform: "Google", height: 50 },
  { platform: "X", height: 35 },
  { platform: "Yelp", height: 65 },
  { platform: "LinkedIn", height: 45 },
];

export function AnalyticsMockup() {
  return (
    <div className="bg-muted/30 rounded-2xl border border-border p-4 md:p-6 space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-white rounded-lg border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-lg font-semibold">{metric.value}</p>
            <p className={`text-xs flex items-center justify-center gap-0.5 ${metric.positive ? "text-emerald-600" : "text-red-600"}`}>
              {metric.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-muted-foreground mb-4">Interaction Volume by Platform</p>
        <div className="flex items-end gap-2 h-32">
          {chartData.map((bar, i) => (
            <div
              key={i}
              className={`flex-1 ${platformColors[bar.platform]} rounded-t transition-all hover:opacity-80`}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          {Object.entries(platformColors).slice(0, 6).map(([platform, color]) => (
            <div key={platform} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground">{platform}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
