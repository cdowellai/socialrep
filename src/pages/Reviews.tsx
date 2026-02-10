import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Link2,
  Mail,
  MessageSquareOff,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReviewFilters } from "@/components/reviews/ReviewFilters";
import { AIRespondAllModal } from "@/components/reviews/AIRespondAllModal";
import { ReviewRequestModal } from "@/components/reviews/ReviewRequestModal";
import { ReviewLinkGenerator } from "@/components/reviews/ReviewLinkGenerator";
import { ReviewResponseThread } from "@/components/reviews/ReviewResponseThread";
import { useReviews, type ReviewFilters as Filters } from "@/hooks/useReviews";

const renderStars = (rating: number | null) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= (rating || 0)
              ? "fill-sentiment-neutral text-sentiment-neutral"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  const [filters, setFilters] = useState<Filters>({
    platform: "all",
    rating: "all",
    status: "all",
  });

  const { reviews, stats, loading, getPendingReviews, respondToReviews } = useReviews(filters);

  const [showAIRespondModal, setShowAIRespondModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);

  const handleSendApprovedResponses = async (
    responses: { reviewId: string; response: string }[]
  ) => {
    await respondToReviews(responses);
  };

  const navigate = useNavigate();
  const displayStats = stats;
  const displayReviews = reviews;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Review Management</h2>
            <p className="text-muted-foreground">
              Monitor and respond to reviews across all platforms
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowLinkGenerator(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              Get Review Link
            </Button>
            <Button variant="outline" onClick={() => setShowRequestModal(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Request Reviews
            </Button>
            <Button variant="hero" onClick={() => setShowAIRespondModal(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Respond All
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Rating */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-sentiment-neutral fill-sentiment-neutral" />
                  <span className="text-sm text-muted-foreground">Avg Rating</span>
                </div>
              </div>
              <div className="text-4xl font-bold">{displayStats.averageRating}</div>
              <div className="flex gap-0.5 mt-2">
                {renderStars(Math.round(displayStats.averageRating))}
              </div>
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total Reviews</span>
              </div>
              <div className="text-4xl font-bold">{displayStats.totalReviews.toLocaleString()}</div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Response Rate</span>
              </div>
              <div className="text-4xl font-bold">{displayStats.responseRate}%</div>
              <Progress value={displayStats.responseRate} className="mt-2" />
            </CardContent>
          </Card>

          {/* Pending Responses */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Pending Responses</span>
              </div>
              <div className="text-4xl font-bold text-sentiment-neutral">{displayStats.pendingCount}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setFilters({ ...filters, status: "pending" })}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution & Platform Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayStats.ratingDistribution.map((item) => (
                  <button
                    key={item.stars}
                    className="w-full flex items-center gap-4 hover:bg-muted/50 rounded-lg p-1 transition-colors"
                    onClick={() => setFilters({ ...filters, rating: item.stars.toString() })}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{item.stars}</span>
                      <Star className="h-4 w-4 fill-sentiment-neutral text-sentiment-neutral" />
                    </div>
                    <div className="flex-1">
                      <Progress value={item.percentage} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>By Platform</CardTitle>
            </CardHeader>
            <CardContent>
              {displayStats.platforms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No platform data yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {displayStats.platforms.map((platform) => (
                    <button
                      key={platform.name}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      onClick={() => setFilters({ ...filters, platform: platform.name.toLowerCase() })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border">
                          <span className="text-sm font-bold">{platform.name[0]}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {platform.count} reviews
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-sentiment-neutral text-sentiment-neutral" />
                            <span className="font-semibold">{platform.rating}</span>
                          </div>
                        </div>
                        {platform.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-sentiment-positive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-sentiment-negative" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <ReviewFilters
          filters={filters}
          onFiltersChange={setFilters}
          pendingCount={displayStats.pendingCount}
        />

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reviews</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ platform: "all", rating: "all", status: "all" })}
            >
              View All Reviews
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : displayReviews.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquareOff className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-1">No reviews yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect a platform to start monitoring your reviews
                </p>
                <Button variant="outline" onClick={() => navigate("/dashboard/settings?tab=platforms")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Connect a Platform
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                          {review.reviewer_name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{review.reviewer_name || "Anonymous"}</p>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {review.platform}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.response ? (
                          <Badge className="bg-sentiment-positive/10 text-sentiment-positive">
                            Responded
                          </Badge>
                        ) : (
                          <Badge className="bg-sentiment-neutral/10 text-sentiment-neutral">
                            Pending
                          </Badge>
                        )}
                        {review.review_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(review.review_url!, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.content}</p>

                    {/* Response Thread */}
                    <ReviewResponseThread
                      response={review.response}
                      respondedAt={review.responded_at}
                      responseType={(review as any).response_type}
                    />

                    {!review.response && (
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Response
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Full Review
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AIRespondAllModal
        isOpen={showAIRespondModal}
        onClose={() => setShowAIRespondModal(false)}
        pendingReviews={getPendingReviews()}
        onSendApproved={handleSendApprovedResponses}
      />

      <ReviewRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        businessName="Your Business"
      />

      <ReviewLinkGenerator
        isOpen={showLinkGenerator}
        onClose={() => setShowLinkGenerator(false)}
      />
    </DashboardLayout>
  );
}
