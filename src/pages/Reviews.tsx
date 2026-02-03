import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";

const reviewStats = {
  averageRating: 4.7,
  totalReviews: 1284,
  ratingDistribution: [
    { stars: 5, count: 856, percentage: 67 },
    { stars: 4, count: 257, percentage: 20 },
    { stars: 3, count: 95, percentage: 7 },
    { stars: 2, count: 51, percentage: 4 },
    { stars: 1, count: 25, percentage: 2 },
  ],
  platforms: [
    { name: "Google", rating: 4.8, count: 543, trend: "up" },
    { name: "Yelp", rating: 4.5, count: 312, trend: "up" },
    { name: "Facebook", rating: 4.7, count: 245, trend: "down" },
    { name: "TripAdvisor", rating: 4.6, count: 184, trend: "up" },
  ],
};

const recentReviews = [
  {
    id: 1,
    platform: "google",
    author: "Alex Thompson",
    rating: 5,
    content: "Absolutely fantastic service! The team went above and beyond to help me. Highly recommend to anyone looking for quality and professionalism.",
    date: "2 hours ago",
    responded: true,
  },
  {
    id: 2,
    platform: "yelp",
    author: "Maria Garcia",
    rating: 4,
    content: "Good experience overall. The product quality is great, but shipping took a bit longer than expected. Will definitely order again though!",
    date: "1 day ago",
    responded: false,
  },
  {
    id: 3,
    platform: "facebook",
    author: "David Kim",
    rating: 3,
    content: "Service was okay. Had some communication issues but they resolved it eventually. Room for improvement in customer support response times.",
    date: "2 days ago",
    responded: true,
  },
  {
    id: 4,
    platform: "google",
    author: "Jennifer Lee",
    rating: 5,
    content: "Best purchase I've made! The quality exceeded my expectations and the customer service team was incredibly helpful and responsive.",
    date: "3 days ago",
    responded: false,
  },
];

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-sentiment-neutral text-sentiment-neutral"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Review Management</h2>
            <p className="text-muted-foreground">
              Monitor and respond to reviews across all platforms
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Request Reviews</Button>
            <Button variant="hero">
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
                <div className="flex items-center gap-1 text-sm text-sentiment-positive">
                  +0.2
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="text-4xl font-bold">{reviewStats.averageRating}</div>
              <div className="flex gap-0.5 mt-2">
                {renderStars(Math.round(reviewStats.averageRating))}
              </div>
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total Reviews</span>
                <div className="flex items-center gap-1 text-sm text-sentiment-positive">
                  +48 this month
                </div>
              </div>
              <div className="text-4xl font-bold">{reviewStats.totalReviews.toLocaleString()}</div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <div className="flex items-center gap-1 text-sm text-sentiment-positive">
                  +5%
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="text-4xl font-bold">94%</div>
              <Progress value={94} className="mt-2" />
            </CardContent>
          </Card>

          {/* Pending Responses */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Pending Responses</span>
              </div>
              <div className="text-4xl font-bold text-sentiment-neutral">12</div>
              <Button variant="outline" size="sm" className="mt-2">
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
                {reviewStats.ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-4">
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
                  </div>
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
              <div className="space-y-4">
                {reviewStats.platforms.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border">
                        <span className="text-sm font-bold">{platform.name[0]}</span>
                      </div>
                      <div>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reviews</CardTitle>
            <Button variant="outline" size="sm">
              View All Reviews
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                        {review.author[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{review.author}</p>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {review.platform}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.responded ? (
                        <Badge className="bg-sentiment-positive/10 text-sentiment-positive">
                          Responded
                        </Badge>
                      ) : (
                        <Badge className="bg-sentiment-neutral/10 text-sentiment-neutral">
                          Pending
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                  {!review.responded && (
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
