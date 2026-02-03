import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";

const stats = [
  {
    title: "Total Interactions",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Avg Rating",
    value: "4.7",
    change: "+0.3",
    trend: "up",
    icon: Star,
  },
  {
    title: "Response Rate",
    value: "94%",
    change: "+5.2%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Avg Response Time",
    value: "2.4h",
    change: "-18%",
    trend: "up",
    icon: Clock,
  },
];

const recentInteractions = [
  {
    id: 1,
    platform: "instagram",
    author: "@tech_lover",
    content: "Amazing product! Absolutely love the quality 🔥",
    sentiment: "positive",
    time: "5m ago",
  },
  {
    id: 2,
    platform: "google",
    author: "John D.",
    content: "Great service but delivery took longer than expected",
    sentiment: "neutral",
    time: "12m ago",
  },
  {
    id: 3,
    platform: "twitter",
    author: "@frustrated_user",
    content: "Still waiting on my support ticket #5847...",
    sentiment: "negative",
    time: "25m ago",
  },
  {
    id: 4,
    platform: "facebook",
    author: "Sarah M.",
    content: "Can you tell me more about the Pro plan features?",
    sentiment: "neutral",
    time: "1h ago",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
            <p className="text-muted-foreground">
              Here's what's happening with your social presence today.
            </p>
          </div>
          <Button variant="hero">
            <Zap className="h-4 w-4 mr-2" />
            AI Auto-Respond
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-sentiment-positive" : "text-sentiment-negative"
                    }`}
                  >
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Interactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Interactions</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/inbox">View All</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInteractions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        interaction.sentiment === "positive"
                          ? "bg-sentiment-positive"
                          : interaction.sentiment === "negative"
                          ? "bg-sentiment-negative"
                          : "bg-sentiment-neutral"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent capitalize">
                          {interaction.platform}
                        </span>
                        <span className="text-sm font-medium">{interaction.author}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {interaction.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {interaction.content}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Reply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Pending (12)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Star className="h-4 w-4 mr-2" />
                Request Reviews
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button variant="hero" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Process All with AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
