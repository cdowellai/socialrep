import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Sparkles,
  Check,
  X,
  Pencil,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Review = Tables<"reviews">;

interface ReviewDraft {
  review: Review;
  draft: string;
  status: "pending" | "approved" | "skipped" | "editing";
  editedDraft?: string;
}

interface AIRespondAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviews: Review[];
  onSendApproved: (responses: { reviewId: string; response: string }[]) => Promise<void>;
}

const generateMockDraft = (review: Review): string => {
  const rating = review.rating || 3;
  if (rating >= 4) {
    return `Thank you so much for your wonderful ${rating}-star review, ${review.reviewer_name || "valued customer"}! We're thrilled to hear about your positive experience. Your kind words mean a lot to our team, and we look forward to serving you again soon!`;
  } else if (rating === 3) {
    return `Thank you for taking the time to share your feedback, ${review.reviewer_name || "valued customer"}. We appreciate your honest review and are always looking for ways to improve. If there's anything specific we can do to earn that extra star next time, please don't hesitate to reach out!`;
  } else {
    return `We sincerely apologize for not meeting your expectations, ${review.reviewer_name || "valued customer"}. Your feedback is incredibly valuable, and we'd love the opportunity to make things right. Please reach out to us directly so we can address your concerns and improve your experience.`;
  }
};

export function AIRespondAllModal({
  isOpen,
  onClose,
  pendingReviews,
  onSendApproved,
}: AIRespondAllModalProps) {
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && pendingReviews.length > 0) {
      setGenerating(true);
      // Simulate AI generation
      const timer = setTimeout(() => {
        setDrafts(
          pendingReviews.map((review) => ({
            review,
            draft: generateMockDraft(review),
            status: "pending",
          }))
        );
        setGenerating(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setDrafts([]);
    }
  }, [isOpen, pendingReviews]);

  const handleApprove = (index: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, status: "approved" as const } : d
      )
    );
  };

  const handleSkip = (index: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, status: "skipped" as const } : d
      )
    );
  };

  const handleEdit = (index: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === index
          ? { ...d, status: "editing" as const, editedDraft: d.editedDraft || d.draft }
          : d
      )
    );
  };

  const handleSaveEdit = (index: number) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === index
          ? { ...d, status: "approved" as const, draft: d.editedDraft || d.draft }
          : d
      )
    );
  };

  const handleEditChange = (index: number, value: string) => {
    setDrafts((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, editedDraft: value } : d
      )
    );
  };

  const handleSendAllApproved = async () => {
    const approved = drafts.filter((d) => d.status === "approved");
    if (approved.length === 0) return;

    setSending(true);
    try {
      await onSendApproved(
        approved.map((d) => ({
          reviewId: d.review.id,
          response: d.draft,
        }))
      );
      onClose();
    } finally {
      setSending(false);
    }
  };

  const approvedCount = drafts.filter((d) => d.status === "approved").length;
  const pendingCount = drafts.filter((d) => d.status === "pending").length;

  const renderStars = (rating: number | null) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3 w-3",
            star <= (rating || 0)
              ? "fill-sentiment-neutral text-sentiment-neutral"
              : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Responses
          </DialogTitle>
          <DialogDescription>
            Review and approve AI-generated responses before sending. Edit any
            response or skip reviews you don't want to respond to.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Generating AI responses for {pendingReviews.length} reviews...
              </p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending reviews to respond to.
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((item, index) => (
                <div
                  key={item.review.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    item.status === "approved" && "border-sentiment-positive/50 bg-sentiment-positive/5",
                    item.status === "skipped" && "border-muted opacity-50",
                    item.status === "editing" && "border-primary"
                  )}
                >
                  {/* Review Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.review.reviewer_name || "Anonymous"}
                        </span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.review.platform}
                        </Badge>
                        {renderStars(item.review.rating)}
                      </div>
                      <Badge
                        variant={
                          item.status === "approved"
                            ? "default"
                            : item.status === "skipped"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {item.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                        {item.status === "skipped" && <X className="h-3 w-3 mr-1" />}
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                      "{item.review.content}"
                    </p>
                  </div>

                  {/* AI Response Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">AI-Generated Response:</span>
                    </div>

                    {item.status === "editing" ? (
                      <div className="space-y-2">
                        <Textarea
                          value={item.editedDraft}
                          onChange={(e) => handleEditChange(index, e.target.value)}
                          rows={4}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(index)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save & Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDrafts((prev) =>
                                prev.map((d, i) =>
                                  i === index ? { ...d, status: "pending" as const } : d
                                )
                              )
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm p-3 rounded border bg-card">
                          {item.draft}
                        </p>

                        {item.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(index)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(index)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSkip(index)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Skip
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <div className="flex items-center gap-4 flex-1 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{approvedCount}</strong> approved
            </span>
            <span>
              <strong className="text-foreground">{pendingCount}</strong> pending
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSendAllApproved}
              disabled={approvedCount === 0 || sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send {approvedCount} Approved
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
