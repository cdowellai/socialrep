import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, Edit3, Star } from "lucide-react";
import { useAIFeedback } from "@/hooks/useAIFeedback";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AIResponseFeedbackProps {
  interactionId: string;
  aiResponse: string;
  onAccept: (response: string) => void;
  onReject: () => void;
}

export function AIResponseFeedback({
  interactionId,
  aiResponse,
  onAccept,
  onReject,
}: AIResponseFeedbackProps) {
  const { submitFeedback, loading } = useAIFeedback();
  const { toast } = useToast();
  const [editedResponse, setEditedResponse] = useState(aiResponse);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rating, setRating] = useState<number>(0);

  const handleAccept = async () => {
    const success = await submitFeedback({
      interactionId,
      originalResponse: aiResponse,
      feedbackType: "accepted",
      rating: rating || undefined,
    });

    if (success) {
      toast({ title: "Response accepted", description: "Feedback recorded to improve AI" });
      onAccept(aiResponse);
    }
  };

  const handleEdit = async () => {
    const success = await submitFeedback({
      interactionId,
      originalResponse: aiResponse,
      editedResponse,
      feedbackType: "edited",
      rating: rating || undefined,
    });

    if (success) {
      toast({ title: "Response updated", description: "Your edits help train the AI" });
      setShowEditDialog(false);
      onAccept(editedResponse);
    }
  };

  const handleReject = async () => {
    const success = await submitFeedback({
      interactionId,
      originalResponse: aiResponse,
      feedbackType: "rejected",
      rejectionReason: rejectionReason || undefined,
    });

    if (success) {
      toast({ title: "Response rejected", description: "We'll improve based on your feedback" });
      setShowRejectDialog(false);
      onReject();
    }
  };

  return (
    <div className="space-y-3">
      {/* Rating Stars */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rate this response:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  star <= rating
                    ? "fill-sentiment-positive text-sentiment-positive"
                    : "text-muted-foreground hover:text-sentiment-positive"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={handleAccept}
          disabled={loading}
          className="flex-1"
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEditDialog(true)}
          disabled={loading}
          className="flex-1"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowRejectDialog(true)}
          disabled={loading}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Response</DialogTitle>
            <DialogDescription>
              Make changes to improve the response. Your edits help train the AI.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedResponse}
            onChange={(e) => setEditedResponse(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              Save & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject AI Response</DialogTitle>
            <DialogDescription>
              Tell us why this response wasn't helpful (optional).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="The tone was too formal, it missed the question, etc."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
