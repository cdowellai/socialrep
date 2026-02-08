import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Check,
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

export function ContentAnalytics() {
  const { posts, published, failed, scheduled } = useScheduledPosts();

  // Calculate stats
  const totalPublished = published.length;
  const totalFailed = failed.length;
  const totalScheduled = scheduled.length;
  const successRate =
    totalPublished + totalFailed > 0
      ? Math.round((totalPublished / (totalPublished + totalFailed)) * 100)
      : 100;

  // Platform breakdown
  const platformCounts: Record<string, number> = {};
  posts.forEach((post) => {
    post.platforms.forEach((platform) => {
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });
  });

  // Average predicted engagement for published posts
  const avgEngagement = published.reduce(
    (acc, post) => {
      if (post.predicted_engagement) {
        acc.likes += post.predicted_engagement.likes || 0;
        acc.comments += post.predicted_engagement.comments || 0;
        acc.shares += post.predicted_engagement.shares || 0;
        acc.count += 1;
      }
      return acc;
    },
    { likes: 0, comments: 0, shares: 0, count: 0 }
  );

  const avgLikes = avgEngagement.count > 0 ? Math.round(avgEngagement.likes / avgEngagement.count) : 0;
  const avgComments = avgEngagement.count > 0 ? Math.round(avgEngagement.comments / avgEngagement.count) : 0;
  const avgShares = avgEngagement.count > 0 ? Math.round(avgEngagement.shares / avgEngagement.count) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Published</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPublished}</div>
            <p className="text-xs text-muted-foreground">posts this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScheduled}</div>
            <p className="text-xs text-muted-foreground">upcoming posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">publish success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Posts by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(platformCounts).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(platformCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([platform, count]) => {
                    const Icon = platformIcons[platform];
                    const maxCount = Math.max(...Object.values(platformCounts));
                    const percentage = (count / maxCount) * 100;

                    return (
                      <div key={platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span className="text-sm font-medium capitalize">
                              {platform}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {count} posts
                          </span>
                        </div>
                        <div className="h-2 bg-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predicted engagement averages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Avg. Predicted Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgEngagement.count === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No engagement data yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-accent/50">
                  <div className="text-2xl font-bold">{avgLikes.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Avg. Likes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/50">
                  <div className="text-2xl font-bold">{avgComments.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Avg. Comments</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/50">
                  <div className="text-2xl font-bold">{avgShares.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Avg. Shares</div>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Based on AI predictions from {avgEngagement.count} posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity yet. Create your first post!
            </div>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {post.platforms.slice(0, 2).map((platform) => {
                        const Icon = platformIcons[platform];
                        return Icon ? (
                          <Icon key={platform} className="h-4 w-4" />
                        ) : null;
                      })}
                    </div>
                    <span className="text-sm line-clamp-1 max-w-[300px]">
                      {post.content}
                    </span>
                  </div>
                  <Badge
                    variant={
                      post.status === "published"
                        ? "default"
                        : post.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
