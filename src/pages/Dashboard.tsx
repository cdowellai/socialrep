import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { PlatformBreakdownChart } from "@/components/dashboard/PlatformBreakdownChart";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInteractions } from "@/hooks/useInteractions";
import { useReviews } from "@/hooks/useReviews";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Star,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Helper to calculate stats for a date range
function getStatsForPeriod(
  interactions: any[],
  reviews: any[],
  startDate: Date,
  endDate: Date
) {
  const periodInteractions = interactions.filter((i) => {
    const date = new Date(i.created_at);
    return date >= startDate && date < endDate;
  });

  const periodReviews = reviews.filter((r) => {
    const date = new Date(r.created_at);
    return date >= startDate && date < endDate;
  });

  const pending = periodInteractions.filter((i) => i.status === "pending").length;
  const responded = periodInteractions.filter((i) => i.status === "responded").length;
  const urgent = periodInteractions.filter((i) => (i.urgency_score || 0) >= 7).length;
  const avgRating =
    periodReviews.length > 0
      ? periodReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / periodReviews.length
      : 0;
  const responseRate =
    periodInteractions.length > 0
      ? (responded / periodInteractions.length) * 100
      : 0;

  // Calculate average response time (in hours)
  const respondedWithTime = periodInteractions.filter(
    (i) => i.status === "responded" && i.responded_at
  );
  let avgResponseTime = 0;
  if (respondedWithTime.length > 0) {
    const totalTime = respondedWithTime.reduce((sum, i) => {
      const created = new Date(i.created_at).getTime();
      const responded = new Date(i.responded_at).getTime();
      return sum + (responded - created);
    }, 0);
    avgResponseTime = totalTime / respondedWithTime.length / (1000 * 60 * 60); // Convert to hours
  }

  return {
    pending,
    responded,
    urgent,
    avgRating,
    responseRate,
    avgResponseTime,
    totalInteractions: periodInteractions.length,
  };
}

// Calculate percentage change between two values
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Format response time for display
function formatResponseTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { interactions, loading: interactionsLoading } = useInteractions();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { loading: leadsLoading } = useLeads();

  const loading = interactionsLoading || reviewsLoading || leadsLoading;

  // Calculate current and previous period stats for trends
  const { currentStats, previousStats, trends } = useMemo(() => {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);

    const current = getStatsForPeriod(interactions, reviews, currentPeriodStart, now);
    const previous = getStatsForPeriod(interactions, reviews, previousPeriodStart, currentPeriodStart);

    return {
      currentStats: current,
      previousStats: previous,
      trends: {
        pending: calculateTrend(current.pending, previous.pending),
        urgent: calculateTrend(current.urgent, previous.urgent),
        avgRating: calculateTrend(current.avgRating, previous.avgRating),
        responseRate: calculateTrend(current.responseRate, previous.responseRate),
        avgResponseTime: calculateTrend(current.avgResponseTime, previous.avgResponseTime),
      },
    };
  }, [interactions, reviews]);

  // Calculate overall stats (not just current period)
  const pendingInteractions = interactions.filter(i => i.status === "pending").length;
  const respondedInteractions = interactions.filter(i => i.status === "responded").length;
  const urgentInteractions = interactions.filter(i => (i.urgency_score || 0) >= 7).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";
  const recentInteractions = interactions.slice(0, 5);

  // Calculate overall average response time
  const respondedWithTime = interactions.filter(
    (i) => i.status === "responded" && i.responded_at
  );
  const avgResponseTimeHours = respondedWithTime.length > 0
    ? respondedWithTime.reduce((sum, i) => {
        const created = new Date(i.created_at).getTime();
        const responded = new Date(i.responded_at!).getTime();
        return sum + (responded - created);
      }, 0) / respondedWithTime.length / (1000 * 60 * 60)
    : 0;

  const handleStatClick = (href: string, filterParam?: string) => {
    navigate(filterParam ? `${href}?${filterParam}` : href);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
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

  

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid - 5 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Pending Messages"
            value={pendingInteractions}
            icon={MessageSquare}
            color="text-primary"
            bgColor="bg-primary/10"
            onClick={() => handleStatClick("/dashboard/inbox", "status=pending")}
            trend={{ value: trends.pending, isPositive: false }}
          />
          <KPICard
            title="Urgent Items"
            value={urgentInteractions}
            icon={AlertTriangle}
            color="text-sentiment-negative"
            bgColor="bg-sentiment-negative/10"
            onClick={() => handleStatClick("/dashboard/inbox", "urgent=true")}
            trend={{ value: trends.urgent, isPositive: false }}
          />
          <KPICard
            title="Avg. Review Rating"
            value={avgRating}
            icon={Star}
            color="text-sentiment-positive"
            bgColor="bg-sentiment-positive/10"
            onClick={() => handleStatClick("/dashboard/reviews")}
            trend={{ value: trends.avgRating, isPositive: true }}
          />
          <KPICard
            title="Response Rate"
            value={interactions.length > 0 
              ? `${Math.round((respondedInteractions / interactions.length) * 100)}%` 
              : "0%"}
            icon={TrendingUp}
            color="text-sentiment-positive"
            bgColor="bg-sentiment-positive/10"
            onClick={() => handleStatClick("/dashboard/analytics")}
            trend={{ value: trends.responseRate, isPositive: true }}
          />
          <KPICard
            title="Avg. Response Time"
            value={avgResponseTimeHours > 0 ? formatResponseTime(avgResponseTimeHours) : "—"}
            icon={Clock}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
            onClick={() => handleStatClick("/dashboard/analytics")}
            trend={{ value: trends.avgResponseTime, isPositive: false }}
          />
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
                  <p className="text-sm mt-2">Connect a platform to start receiving interactions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {/* Sentiment Dot */}
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
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
                          
                          <div className="ml-auto flex items-center gap-2">
                            {/* Assigned Team Member Avatar */}
                            {interaction.assigned_to && (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                                  A
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            {interaction.status === "pending" ? (
                              <AlertCircle className="h-3.5 w-3.5 text-sentiment-neutral" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-sentiment-positive" />
                            )}
                          </div>
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
