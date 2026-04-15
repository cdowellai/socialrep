import { useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { PlatformBreakdownChart } from "@/components/dashboard/PlatformBreakdownChart";
import { KPICard } from "@/components/dashboard/KPICard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInteractions } from "@/hooks/useInteractions";
import { useReviews } from "@/hooks/useReviews";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare, Star, Zap, Brain, Users,
  Sparkles, ArrowRight, Globe, Settings, BookOpen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function getStatsForPeriod(interactions: any[], reviews: any[], startDate: Date, endDate: Date) {
  const pi = interactions.filter((i) => { const d = new Date(i.created_at); return d >= startDate && d < endDate; });
  const pr = reviews.filter((r) => { const d = new Date(r.created_at); return d >= startDate && d < endDate; });
  const responded = pi.filter((i) => i.status === "responded").length;
  const avgRating = pr.length > 0 ? pr.reduce((s, r) => s + (r.rating || 0), 0) / pr.length : 0;
  const responseRate = pi.length > 0 ? (responded / pi.length) * 100 : 0;
  const positiveCount = pi.filter((i) => i.sentiment === "positive").length;
  const sentimentScore = pi.length > 0 ? Math.round((positiveCount / pi.length) * 100) : 0;
  return { responded, avgRating, responseRate, sentimentScore, totalInteractions: pi.length };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getSparklineData(interactions: any[], key: "total" | "responded" | "sentiment"): number[] {
  const days = 7;
  const now = new Date();
  const data: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayInts = interactions.filter((int: any) => new Date(int.created_at).toISOString().split("T")[0] === dateStr);
    if (key === "total") data.push(dayInts.length);
    else if (key === "responded") data.push(dayInts.filter((i: any) => i.status === "responded").length);
    else data.push(dayInts.filter((i: any) => i.sentiment === "positive").length);
  }
  return data;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { interactions, loading: interactionsLoading } = useInteractions();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { profile } = useProfile();
  const loading = interactionsLoading || reviewsLoading;

  const hasData = interactions.length > 0;
  const hasReviews = reviews.length > 0;

  const { trends } = useMemo(() => {
    const now = new Date();
    const cs = new Date(now); cs.setDate(cs.getDate() - 7);
    const ps = new Date(cs); ps.setDate(ps.getDate() - 7);
    const current = getStatsForPeriod(interactions, reviews, cs, now);
    const previous = getStatsForPeriod(interactions, reviews, ps, cs);
    return {
      trends: {
        conversations: calculateTrend(current.totalInteractions, previous.totalInteractions),
        avgRating: calculateTrend(current.avgRating, previous.avgRating),
        responseRate: calculateTrend(current.responseRate, previous.responseRate),
        sentimentScore: calculateTrend(current.sentimentScore, previous.sentimentScore),
      },
    };
  }, [interactions, reviews]);

  const activeConversations = interactions.filter(i => i.status === "pending").length;
  const respondedInteractions = interactions.filter(i => i.status === "responded").length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";
  const responseRate = interactions.length > 0
    ? `${Math.round((respondedInteractions / interactions.length) * 100)}%` : "0%";
  const positiveCount = interactions.filter(i => i.sentiment === "positive").length;
  const sentimentScore = interactions.length > 0
    ? `${Math.round((positiveCount / interactions.length) * 100)}%` : "0%";

  const recentInteractions = interactions.slice(0, 5);
  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";
  const firstName = profile?.full_name?.split(" ")[0] || "";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 max-w-[1400px]">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-6">
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1400px]">
        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <h2 className="text-3xl font-bold tracking-tight">
            Good {greeting}{firstName ? ", " : ""}
            {firstName && (
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {firstName}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {hasData
              ? "Here's what's happening across your platforms."
              : "Let's get your reputation engine running."}
          </p>
        </motion.div>

        {/* KPI Cards — 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Conversations */}
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            {hasData ? (
              <KPICard
                title="Active Conversations"
                value={activeConversations}
                trend={{ value: trends.conversations, isPositive: true }}
                sparklineData={getSparklineData(interactions, "total")}
                onClick={() => navigate("/dashboard/inbox?status=pending")}
              />
            ) : (
              <KPICard
                variant="onboarding"
                onboardingIcon={Globe}
                onboardingTitle="Connect your first platform"
                onboardingDescription="Link Facebook, Instagram, Google, or any platform to start receiving interactions."
                onboardingCta="Connect Platform"
                onboardingGradient="from-primary/10 to-primary/5"
                onCtaClick={() => navigate("/dashboard/settings")}
              />
            )}
          </motion.div>

          {/* Avg. Rating */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
            {hasReviews ? (
              <KPICard
                title="Avg. Rating"
                value={avgRating}
                trend={{ value: trends.avgRating, isPositive: true }}
                onClick={() => navigate("/dashboard/reviews")}
              />
            ) : (
              <KPICard
                variant="onboarding"
                onboardingIcon={Star}
                onboardingTitle="Start collecting reviews"
                onboardingDescription="Connect review platforms to monitor and respond to customer feedback."
                onboardingCta="Set Up Reviews"
                onboardingGradient="from-sentiment-positive/10 to-sentiment-positive/5"
                onCtaClick={() => navigate("/dashboard/reviews")}
              />
            )}
          </motion.div>

          {/* Response Rate */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            {hasData ? (
              <KPICard
                title="Response Rate"
                value={responseRate}
                trend={{ value: trends.responseRate, isPositive: true }}
                sparklineData={getSparklineData(interactions, "responded")}
                onClick={() => navigate("/dashboard/analytics")}
              />
            ) : (
              <KPICard
                variant="onboarding"
                onboardingIcon={Zap}
                onboardingTitle="Enable AI responses"
                onboardingDescription="Let AI draft responses to save time and keep your response rate high."
                onboardingCta="Configure AI"
                onboardingGradient="from-accent/20 to-accent/5"
                onCtaClick={() => navigate("/dashboard/settings")}
              />
            )}
          </motion.div>

          {/* Sentiment Score */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            {hasData ? (
              <KPICard
                title="Sentiment Score"
                value={sentimentScore}
                trend={{ value: trends.sentimentScore, isPositive: true }}
                sparklineData={getSparklineData(interactions, "sentiment")}
                onClick={() => navigate("/dashboard/analytics")}
              />
            ) : (
              <KPICard
                variant="onboarding"
                onboardingIcon={Brain}
                onboardingTitle="Analyze interactions"
                onboardingDescription="AI-powered sentiment analysis helps you understand how customers feel."
                onboardingCta="Learn More"
                onboardingGradient="from-secondary/30 to-secondary/10"
                onCtaClick={() => navigate("/dashboard/analytics")}
              />
            )}
          </motion.div>
        </div>

        {/* Quick Actions — Horizontal strip */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/dashboard/inbox", icon: MessageSquare, label: "Smart Inbox", badge: activeConversations },
              { href: "/dashboard/reviews", icon: Star, label: "Reviews" },
              { href: "/dashboard/content", icon: Sparkles, label: "Content" },
              { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            ].map((action) => (
              <Link key={action.href} to={action.href}>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group cursor-pointer">
                  <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">{action.label}</span>
                  {action.badge && action.badge > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-md ml-1">{action.badge}</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardTrendChart interactions={interactions} loading={loading} />
          <PlatformBreakdownChart interactions={interactions} loading={loading} />
        </motion.div>

        {/* Recent Interactions */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center justify-between p-8 pb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Interactions</h3>
              {recentInteractions.length > 0 && (
                <Link
                  to="/dashboard/inbox"
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            <div className="px-8 pb-8">
              {recentInteractions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No interactions yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">They'll appear here once you connect a platform</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {recentInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate("/dashboard/inbox")}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
