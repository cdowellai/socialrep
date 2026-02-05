import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { PlatformBreakdownChart } from "@/components/dashboard/PlatformBreakdownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useInteractions } from "@/hooks/useInteractions";
import { useReviews } from "@/hooks/useReviews";
import { useLeads } from "@/hooks/useLeads";
import { seedSampleData } from "@/lib/sampleData";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Star,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Beaker,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { interactions, loading: interactionsLoading, refetch: refetchInteractions } = useInteractions();
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews();
  const { leads, loading: leadsLoading, refetch: refetchLeads } = useLeads();
  const [seeding, setSeeding] = useState(false);

  const loading = interactionsLoading || reviewsLoading || leadsLoading;

  // Calculate stats
  const pendingInteractions = interactions.filter(i => i.status === "pending").length;
  const respondedInteractions = interactions.filter(i => i.status === "responded").length;
  const urgentInteractions = interactions.filter(i => (i.urgency_score || 0) >= 7).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";
  const qualifiedLeads = leads.filter(l => l.status === "qualified").length;
  const recentInteractions = interactions.slice(0, 5);

  const handleSeedData = async () => {
    if (!user) return;
    
    setSeeding(true);
    const result = await seedSampleData(user.id);
    
    if (result.success) {
      toast({
        title: "Sample data loaded!",
        description: "Your sandbox is ready with sample interactions, reviews, and leads.",
      });
      refetchInteractions();
      refetchReviews();
      refetchLeads();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setSeeding(false);
  };

  const handleStatClick = (href: string, filterParam?: string) => {
    navigate(filterParam ? `${href}?${filterParam}` : href);
  };

  const stats = [
    {
      title: "Pending Messages",
      value: pendingInteractions,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/dashboard/inbox",
      filterParam: "status=pending",
    },
    {
      title: "Urgent Items",
      value: urgentInteractions,
      icon: AlertTriangle,
      color: "text-sentiment-negative",
      bgColor: "bg-sentiment-negative/10",
      href: "/dashboard/inbox",
      filterParam: "urgent=true",
    },
    {
      title: "Avg. Review Rating",
      value: avgRating,
      icon: Star,
      color: "text-sentiment-positive",
      bgColor: "bg-sentiment-positive/10",
      href: "/dashboard/reviews",
    },
    {
      title: "Response Rate",
      value: interactions.length > 0 
        ? `${Math.round((respondedInteractions / interactions.length) * 100)}%` 
        : "0%",
      icon: TrendingUp,
      color: "text-sentiment-positive",
      bgColor: "bg-sentiment-positive/10",
      href: "/dashboard/analytics",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasNoData = interactions.length === 0 && reviews.length === 0 && leads.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Sandbox Banner */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Beaker className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    Sandbox Mode
                    <Badge variant="outline" className="text-xs">Development</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Working with sample data. No live integrations connected.
                  </p>
                </div>
              </div>
              {hasNoData && (
                <Button onClick={handleSeedData} disabled={seeding}>
                  {seeding ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Load Sample Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <button
              key={stat.title}
              onClick={() => handleStatClick(stat.href, stat.filterParam)}
              className="text-left w-full"
            >
              <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardTrendChart interactions={interactions} loading={loading} />
          <PlatformBreakdownChart interactions={interactions} loading={loading} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Interactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Interactions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/inbox">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentInteractions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No interactions yet</p>
                  <Button variant="link" onClick={handleSeedData} disabled={seeding}>
                    Load sample data to get started
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
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
                          <span className="text-sm font-medium">
                            {interaction.author_name || "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {interaction.platform}
                          </Badge>
                          {interaction.status === "pending" ? (
                            <AlertCircle className="h-3 w-3 text-sentiment-neutral ml-auto" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-sentiment-positive ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {interaction.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard/inbox">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-3" />
                  Open Smart Inbox
                  {pendingInteractions > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {pendingInteractions}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/dashboard/reviews">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-3" />
                  Manage Reviews
                </Button>
              </Link>
              <Link to="/dashboard/leads">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  View Leads
                </Button>
              </Link>
              <Link to="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
