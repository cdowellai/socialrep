import { TrendingUp, TrendingDown, Star } from "lucide-react";

const kpiData = [
  { label: "Inbox", value: "127", change: "+18%", positive: true },
  { label: "Sentiment", value: "84%", change: "+3%", positive: true },
  { label: "Leads", value: "23", change: "+5 new", positive: true },
  { label: "Avg Response", value: "1.2h", change: "from 4.8h", positive: true },
];

const inboxItems = [
  {
    name: "@sarah_designs",
    avatar: "S",
    avatarColor: "bg-pink-500",
    message: "Love this product! Do you ship to Miami? ✨",
    tag: "Positive",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Mike Thompson",
    avatar: "M",
    avatarColor: "bg-orange-500",
    message: "Still waiting on my order. No response to emails.",
    tag: "Urgent",
    tagColor: "bg-red-100 text-red-700",
  },
  {
    name: "Alex Chen",
    avatar: "A",
    avatarColor: "bg-blue-500",
    message: "Outstanding service and quick delivery!",
    tag: "★★★★★",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    name: "Jen Rivera",
    avatar: "J",
    avatarColor: "bg-purple-500",
    message: "Can I get a refund? This wasn't what I expected.",
    tag: "AI Draft Ready",
    tagColor: "bg-primary/10 text-primary",
  },
];

const chartBars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95];

export function DashboardPreview() {
  return (
    <div className="rounded-xl shadow-2xl shadow-primary/10 border border-border overflow-hidden bg-white">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-md px-3 py-1.5 text-xs text-muted-foreground border border-border max-w-xs mx-auto">
            app.socialrep.ai/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 md:p-6 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiData.map((kpi, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold">{kpi.value}</span>
                <span className={`text-xs flex items-center gap-0.5 ${kpi.positive ? "text-emerald-600" : "text-red-600"}`}>
                  {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Chart */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Interaction Volume</p>
            <div className="flex items-end gap-1.5 h-24">
              {chartBars.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-primary rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Smart Inbox */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Smart Inbox</p>
            <div className="space-y-2">
              {inboxItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-md p-2 border border-border/50">
                  <div className={`w-7 h-7 rounded-full ${item.avatarColor} flex items-center justify-center text-xs font-medium text-white shrink-0`}>
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.message}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
