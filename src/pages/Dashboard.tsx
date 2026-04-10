import { useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { PlatformBreakdownChart } from "@/components/dashboard/PlatformBreakdownChart";
import { KPICard } from "@/components/dashboard/KPICard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInteractions } from "@/hooks/useInteractions";
import { useReviews } from "@/hooks/useReviews";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare, Star, Users, TrendingUp, AlertTriangle, Clock,
  CheckCircle2, AlertCircle, ArrowRight, Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function getStatsForPeriod(interactions: any[], reviews: any[], startDate: Date, endDate: Date) {
  const pi = interactions.filter((i) => { const d = new Date(i.created_at); return d >= startDate && d < endDate; });
  const pr = reviews.filter((r) => { const d = new Date(r.created_at); return d >= startDate && d < endDate; });
  const pending = pi.filter((i) => i.status === "pending").length;
  const responded = pi.filter((i) => i.status === "responded").length;
  const urgent = pi.filter((i) => (i.urgency_score || 0) >= 7).length;
  const avgRating = pr.length > 0 ? pr.reduce((s, r) => s + (r.rating || 0), 0) / pr.length : 0;
  const responseRate = pi.length > 0 ? (responded / pi.length) * 100 : 0;
  const rwt = pi.filter((i) => i.status === "responded" && i.responded_at);
  let avgResponseTime = 0;
  if (rwt.length > 0) {
    avgResponseTime = rwt.reduce((s, i) => s + (new Date(i.responded_at).getTime() - new Date(i.created_at).getTime()), 0) / rwt.length / (1000 * 60 * 60);
  }
  return { pending, responded, urgent, avgRating, responseRate, avgResponseTime, totalInteractions: pi.length };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatResponseTime(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { interactions, loading: interactionsLoading } = useInteractions();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { loading: leadsLoading } = useLeads();
  const loading = interactionsLoading || reviewsLoading || leadsLoading;

  const { trends } = useMemo(() => {
    const now = new Date();
    const cs = new Date(now); cs.setDate(cs.getDate() - 7);
    const ps = new Date(cs); ps.setDate(ps.getDate() - 7);
    const current = getStatsForPeriod(interactions, reviews, cs, now);
    const previous = getStatsForPeriod(interactions, reviews, ps, cs);
    return {
      currentStats: current, previousStats: previous,
      trends: {
        pending: calculateTrend(current.pending, previous.pending),
        urgent: calculateTrend(current.urgent, previous.urgent),
        avgRating: calculateTrend(current.avgRating, previous.avgRating),
        responseRate: calculateTrend(current.responseRate, previous.responseRate),
        avgResponseTime: calculateTrend(current.avgResponseTime, previous.avgResponseTime),
      },
    };
  }, [interactions, reviews]);

  const pendingInteractions = interactions.filter(i => i.status === "pending").length;
  const respondedInteractions = interactions.filter(i => i.status === "responded").length;
  const urgentInteractions = interactions.filter(i => (i.urgency_score || 0) >= 7).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";
  const recentInteractions = interactions.slice(0, 6);

  const respondedWithTime = interactions.filter((i) => i.status === "responded" && i.responded_at);
  const avgResponseTimeHours = respondedWithTime.length > 0
    ? respondedWithTime.reduce((s, i) => s + (new Date(i.responded_at!).getTime() - new Date(i.created_at).getTime()), 0) / respondedWithTime.length / (1000 * 60 * 60) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-5">
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px]">
        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening across your platforms.</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" asChild>
              <Link to="/dashboard/analytics"><TrendingUp className="h-4 w-4" />View Analytics</Link>
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: "Pending Messages", value: pendingInteractions, icon: MessageSquare, color: "text-primary", bgColor: "bg-primary/10", onClick: () => navigate("/dashboard/inbox?status=pending"), trend: { value: trends.pending, isPositive: false } },
            { title: "Urgent Items", value: urgentInteractions, icon: AlertTriangle, color: "text-sentiment-negative", bgColor: "bg-sentiment-negative/10", onClick: () => navigate("/dashboard/inbox?urgent=true"), trend: { value: trends.urgent, isPositive: false } },
            { title: "Avg. Rating", value: avgRating, icon: Star, color: "text-sentiment-positive", bgColor: "bg-sentiment-positive/10", onClick: () => navigate("/dashboard/reviews"), trend: { value: trends.avgRating, isPositive: true } },
            { title: "Response Rate", value: interactions.length > 0 ? `${Math.round((respondedInteractions / interactions.length) * 100)}%` : "0%", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10", onClick: () => navigate("/dashboard/analytics"), trend: { value: trends.responseRate, isPositive: true } },
            { title: "Avg. Response", value: avgResponseTimeHours > 0 ? formatResponseTime(avgResponseTimeHours) : "—", icon: Clock, color: "text-accent-foreground", bgColor: "bg-accent", onClick: () => navigate("/dashboard/analytics"), trend: { value: trends.avgResponseTime, isPositive: false } },
          ].map((kpi, i) => (
            <motion.div key={kpi.title} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardTrendChart interactions={interactions} loading={loading} />
          <PlatformBreakdownChart interactions={interactions} loading={loading} />
        </motion.div>

        {/* Recent + Quick Actions */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Interactions - spans 2 cols */}
          <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Recent Interactions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{interactions.length} total</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-lg" asChild>
                <Link to="/dashboard/inbox">View all <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="px-6 pb-6">
              {recentInteractions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No interactions yet</p>
                  <p className="text-sm mt-1">Connect a platform to start receiving interactions</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate("/dashboard/inbox")}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        interaction.sentiment === "positive" ? "bg-sentiment-positive"
                          : interaction.sentiment === "negative" ? "bg-sentiment-negative"
                          : "bg-sentiment-neutral"
                      }`} />
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={interaction.author_avatar || ""} />
                        <AvatarFallback className="text-[10px] bg-muted font-semibold">
                          {(interaction.author_name || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{interaction.author_name || "Unknown"}</span>
                          <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 rounded-md">{interaction.platform}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{interaction.content}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {interaction.status === "pending" ? (
                          <AlertCircle className="h-3.5 w-3.5 text-sentiment-neutral" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-sentiment-positive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="text-base font-semibold tracking-tight mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/dashboard/inbox", icon: MessageSquare, label: "Smart Inbox", desc: "Respond to messages", badge: pendingInteractions },
                { href: "/dashboard/reviews", icon: Star, label: "Reviews", desc: "Manage your reviews" },
                { href: "/dashboard/leads", icon: Users, label: "Leads", desc: "Track your pipeline" },
                { href: "/dashboard/content", icon: Sparkles, label: "Content", desc: "Create & schedule posts" },
              ].map((action) => (
                <Link key={action.href} to={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                    <div className="h-9 w-9 rounded-lg bg-muted/80 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    {action.badge && action.badge > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-md">{action.badge}</Badge>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
