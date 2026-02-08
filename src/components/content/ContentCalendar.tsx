import { useState, useMemo } from "react";
import { useScheduledPosts, ScheduledPost } from "@/hooks/useScheduledPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  publishing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function ContentCalendar() {
  const { posts, scheduled, loading } = useScheduledPosts();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  // Get posts for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, ScheduledPost[]> = {};
    posts
      .filter((post) => post.scheduled_for)
      .forEach((post) => {
        const dateKey = format(new Date(post.scheduled_for!), "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(post);
      });
    return grouped;
  }, [posts]);

  // Posts for selected date
  const selectedDatePosts = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return postsByDate[dateKey] || [];
  }, [selectedDate, postsByDate]);

  // Days with posts for highlighting
  const daysWithPosts = useMemo(() => {
    return Object.keys(postsByDate).map((dateStr) => new Date(dateStr));
  }, [postsByDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Schedule Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={{
              hasPost: daysWithPosts,
            }}
            modifiersClassNames={{
              hasPost: "bg-primary/20 font-bold",
            }}
            className="w-full"
            classNames={{
              months: "w-full",
              month: "w-full",
              table: "w-full",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "flex-1 h-12 text-center text-sm p-0 relative",
              day: "h-full w-full p-0 font-normal",
              day_selected: "bg-primary text-primary-foreground",
            }}
            components={{
              Day: ({ date, ...props }) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const dayPosts = postsByDate[dateKey] || [];
                const isSelected = isSameDay(date, selectedDate);

                return (
                  <button
                    {...props}
                    className={cn(
                      "h-full w-full flex flex-col items-center justify-start p-1 rounded-md hover:bg-accent transition-colors",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="text-sm">{format(date, "d")}</span>
                    {dayPosts.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayPosts.slice(0, 3).map((post, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              post.status === "scheduled" && "bg-primary",
                              post.status === "published" && "bg-sentiment-positive",
                              post.status === "pending_approval" && "bg-warning",
                              post.status === "draft" && "bg-muted-foreground"
                            )}
                          />
                        ))}
                        {dayPosts.length > 3 && (
                          <span className="text-[8px] text-muted-foreground">
                            +{dayPosts.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Selected date posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {format(selectedDate, "EEEE, MMMM d")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDatePosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No posts scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDatePosts.map((post) => (
                <button
                  key={post.id}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {post.platforms.slice(0, 3).map((platform) => {
                        const Icon = platformIcons[platform];
                        return Icon ? (
                          <Icon key={platform} className="h-3 w-3" />
                        ) : null;
                      })}
                    </div>
                    <Badge className={cn("text-xs", statusColors[post.status])}>
                      {post.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  {post.scheduled_for && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(post.scheduled_for), "h:mm a")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post detail dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedPost.platforms.map((platform) => {
                  const Icon = platformIcons[platform];
                  return Icon ? (
                    <Badge key={platform} variant="secondary" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {platform}
                    </Badge>
                  ) : null;
                })}
                <Badge className={statusColors[selectedPost.status]}>
                  {selectedPost.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm">{selectedPost.content}</p>
              {selectedPost.scheduled_for && (
                <p className="text-sm text-muted-foreground">
                  Scheduled for: {format(new Date(selectedPost.scheduled_for), "PPpp")}
                </p>
              )}
              {selectedPost.ai_generated && (
                <Badge variant="outline" className="text-xs">
                  AI Generated
                </Badge>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
