import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Calendar, TrendingUp, TrendingDown, ArrowUpRight, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";

const periodMap = {
  "7days": "week",
  "30days": "month",
  "90days": "month",
  "12months": "all",
} as const;

export default function AnalyticsPage() {
  const { data, loading, error, fetchAnalytics } = useAnalytics();
  const [period, setPeriod] = useState<string>("30days");

  useEffect(() => {
    const mappedPeriod = periodMap[period as keyof typeof periodMap] || "month";
    fetchAnalytics(mappedPeriod as "day" | "week" | "month" | "all");
  }, [period, fetchAnalytics]);

  // Transform data for charts
  const sentimentData = data ? [
    { name: "Positive", value: data.sentiment.positive, color: "hsl(152, 76%, 43%)" },
    { name: "Neutral", value: data.sentiment.neutral, color: "hsl(38, 92%, 50%)" },
    { name: "Negative", value: data.sentiment.negative, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0) : [];

  const platformDistribution = data ? Object.entries(data.platforms).map(([name, interactions]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    interactions,
    percentage: data.summary.totalInteractions > 0 
      ? Math.round((interactions / data.summary.totalInteractions) * 100) 
      : 0,
  })) : [];

  const trendsData = data ? Object.entries(data.trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      interactions: count,
    })) : [];

  const stats = data ? [
    {
      title: "Reputation Score",
      value: `${data.summary.reputationScore}/100`,
      change: data.summary.reputationScore >= 70 ? "+Good" : "Needs Work",
      trend: data.summary.reputationScore >= 50 ? "up" : "down",
      description: "overall health",
    },
    {
      title: "Total Interactions",
      value: data.summary.totalInteractions.toLocaleString(),
      change: `${data.summary.respondedInteractions} responded`,
      trend: "up",
      description: `${data.summary.responseRate}% response rate`,
    },
    {
      title: "Avg Response Time",
      value: `${data.summary.avgResponseTimeHours}h`,
      change: data.summary.avgResponseTimeHours < 3 ? "Fast" : "Improve",
      trend: data.summary.avgResponseTimeHours < 4 ? "up" : "down",
      description: "to respond",
    },
    {
      title: "Avg Review Rating",
      value: `${data.summary.avgRating}/5`,
      change: `${data.summary.totalReviews} reviews`,
      trend: data.summary.avgRating >= 4 ? "up" : "down",
      description: "from customers",
    },
  ] : [];

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-muted-foreground">
              Track performance and insights across all platforms
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchAnalytics(periodMap[period as keyof typeof periodMap] || "month")}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-sentiment-positive" : "text-sentiment-negative"
                    }`}
                  >
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Data State */}
        {data && data.summary.totalInteractions === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No data available yet. Start by adding interactions in the Smart Inbox.
              </p>
              <Button variant="outline" asChild>
                <a href="/dashboard/inbox">Go to Inbox</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {data && data.summary.totalInteractions > 0 && (
          <Tabs defaultValue="interactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
            </TabsList>

            <TabsContent value="interactions">
              <Card>
                <CardHeader>
                  <CardTitle>Interactions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {trendsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="interactions"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary) / 0.3)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No trend data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {sentimentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sentimentData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {sentimentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No sentiment data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {sentimentData.length > 0 ? (
                      sentimentData.map((item) => {
                        const total = sentimentData.reduce((sum, s) => sum + s.value, 0);
                        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        return (
                          <div key={item.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground">{item.value} ({percentage}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No sentiment data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="platforms">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {platformDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={platformDistribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                          <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="interactions"
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No platform data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
