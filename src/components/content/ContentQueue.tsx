import { useState } from "react";
import { useScheduledPosts, ScheduledPost, PostStatus } from "@/hooks/useScheduledPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  FileEdit,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

const statusConfig: Record<
  PostStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileEdit },
  pending_approval: {
    label: "Pending Approval",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: Clock,
  },
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: Clock,
  },
  publishing: {
    label: "Publishing",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Loader2,
  },
  published: {
    label: "Published",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: Check,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    icon: X,
  },
};

function PostCard({
  post,
  onApprove,
  onReject,
  onCancel,
  onDelete,
}: {
  post: ScheduledPost;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const config = statusConfig[post.status];
  const StatusIcon = config.icon;

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Platforms and status */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {post.platforms.map((platform) => {
                    const Icon = platformIcons[platform];
                    return Icon ? (
                      <div
                        key={platform}
                        className="p-1 rounded bg-accent"
                        title={platform}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    ) : (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    );
                  })}
                </div>
                <Badge className={cn("gap-1", config.color)}>
                  <StatusIcon className={cn("h-3 w-3", post.status === "publishing" && "animate-spin")} />
                  {config.label}
                </Badge>
                {post.ai_generated && (
                  <Badge variant="outline" className="text-xs">
                    AI
                  </Badge>
                )}
              </div>

              {/* Content */}
              <p className="text-sm line-clamp-3 mb-2">{post.content}</p>

              {/* Schedule info */}
              {post.scheduled_for && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(post.scheduled_for), "MMM d, yyyy 'at' h:mm a")}
                </div>
              )}

              {/* Engagement preview */}
              {post.predicted_engagement && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>
                    ~{post.predicted_engagement.likes?.toLocaleString()} likes
                  </span>
                  <span>
                    ~{post.predicted_engagement.comments?.toLocaleString()} comments
                  </span>
                </div>
              )}

              {/* Error message for failed posts */}
              {post.status === "failed" && post.publish_errors && (
                <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
                  {Object.entries(post.publish_errors).map(([platform, error]) => (
                    <div key={platform}>
                      <strong>{platform}:</strong> {error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {post.status === "pending_approval" && (
                  <>
                    <DropdownMenuItem onClick={() => onApprove(post.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReject(post.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {(post.status === "draft" || post.status === "scheduled") && (
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {post.status === "scheduled" && (
                  <DropdownMenuItem onClick={() => onCancel(post.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(post.id);
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ContentQueue() {
  const {
    drafts,
    pendingApproval,
    scheduled,
    published,
    failed,
    loading,
    approvePost,
    rejectPost,
    cancelPost,
    deletePost,
  } = useScheduledPosts();

  const handleReject = (id: string) => {
    rejectPost(id, "Needs revision");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="scheduled">
      <TabsList>
        <TabsTrigger value="drafts" className="gap-2">
          <FileEdit className="h-4 w-4" />
          Drafts
          {drafts.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {drafts.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="pending" className="gap-2">
          <Clock className="h-4 w-4" />
          Pending
          {pendingApproval.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {pendingApproval.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="gap-2">
          <Send className="h-4 w-4" />
          Scheduled
          {scheduled.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {scheduled.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="published" className="gap-2">
          <Check className="h-4 w-4" />
          Published
        </TabsTrigger>
        <TabsTrigger value="failed" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Failed
          {failed.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {failed.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="drafts" className="mt-6">
        {drafts.length === 0 ? (
          <EmptyState
            title="No drafts"
            description="Posts you save as drafts will appear here"
          />
        ) : (
          <div className="space-y-4">
            {drafts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={approvePost}
                onReject={handleReject}
                onCancel={cancelPost}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-6">
        {pendingApproval.length === 0 ? (
          <EmptyState
            title="No pending approvals"
            description="Posts waiting for approval will appear here"
          />
        ) : (
          <div className="space-y-4">
            {pendingApproval.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={approvePost}
                onReject={handleReject}
                onCancel={cancelPost}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="scheduled" className="mt-6">
        {scheduled.length === 0 ? (
          <EmptyState
            title="No scheduled posts"
            description="Schedule a post to see it here"
          />
        ) : (
          <div className="space-y-4">
            {scheduled.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={approvePost}
                onReject={handleReject}
                onCancel={cancelPost}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="published" className="mt-6">
        {published.length === 0 ? (
          <EmptyState
            title="No published posts"
            description="Successfully published posts will appear here"
          />
        ) : (
          <div className="space-y-4">
            {published.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={approvePost}
                onReject={handleReject}
                onCancel={cancelPost}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="failed" className="mt-6">
        {failed.length === 0 ? (
          <EmptyState
            title="No failed posts"
            description="Posts that fail to publish will appear here"
          />
        ) : (
          <div className="space-y-4">
            {failed.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={approvePost}
                onReject={handleReject}
                onCancel={cancelPost}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
