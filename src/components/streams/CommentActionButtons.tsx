import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  EyeOff,
  Eye,
  Mail,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Enums } from "@/integrations/supabase/types";

type Platform = Enums<"interaction_platform">;

// Define which actions each platform supports
const platformCapabilities: Record<Platform, { hide: boolean; sendPM: boolean; delete: boolean }> = {
  facebook: { hide: true, sendPM: true, delete: true },
  instagram: { hide: true, sendPM: true, delete: true },
  twitter: { hide: true, sendPM: true, delete: true },
  linkedin: { hide: false, sendPM: true, delete: true },
  youtube: { hide: true, sendPM: false, delete: true },
  tiktok: { hide: false, sendPM: true, delete: true },
  google: { hide: false, sendPM: false, delete: true },
  yelp: { hide: false, sendPM: true, delete: false },
  tripadvisor: { hide: false, sendPM: false, delete: false },
  trustpilot: { hide: false, sendPM: false, delete: false },
  g2: { hide: false, sendPM: false, delete: false },
  capterra: { hide: false, sendPM: false, delete: false },
  bbb: { hide: false, sendPM: false, delete: false },
  glassdoor: { hide: false, sendPM: false, delete: false },
  amazon: { hide: false, sendPM: false, delete: false },
  appstore: { hide: false, sendPM: false, delete: false },
  playstore: { hide: false, sendPM: false, delete: false },
  other: { hide: false, sendPM: false, delete: false },
};

interface CommentActionButtonsProps {
  platform: Platform;
  authorName?: string | null;
  isHidden?: boolean;
  onReply: () => void;
  onHide?: () => void;
  onUnhide?: () => void;
  onSendPM?: (message: string) => void;
  onDelete?: () => void;
  className?: string;
}

export function CommentActionButtons({
  platform,
  authorName,
  isHidden = false,
  onReply,
  onHide,
  onUnhide,
  onSendPM,
  onDelete,
  className,
}: CommentActionButtonsProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPMDialog, setShowPMDialog] = useState(false);
  const [pmMessage, setPmMessage] = useState("");
  const [sendingPM, setSendingPM] = useState(false);

  const capabilities = platformCapabilities[platform];
  const displayName = authorName || "there";

  const handleOpenPM = () => {
    setPmMessage(`Hi ${displayName}, following up on your comment...`);
    setShowPMDialog(true);
  };

  const handleSendPM = async () => {
    if (!pmMessage.trim()) return;
    setSendingPM(true);
    try {
      onSendPM?.(pmMessage);
      toast({ title: "Message sent", description: `Private message sent to ${displayName}` });
      setShowPMDialog(false);
      setPmMessage("");
    } finally {
      setSendingPM(false);
    }
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
    toast({ title: "Comment deleted", description: "The comment has been permanently deleted from the platform." });
  };

  const handleHide = () => {
    if (isHidden) {
      onUnhide?.();
      toast({ title: "Comment unhidden", description: "The comment is now visible to the public again." });
    } else {
      onHide?.();
      toast({ title: "Comment hidden", description: "The comment has been hidden from public view." });
    }
  };

  return (
    <>
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {/* Reply - always shown, most prominent */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1"
              onClick={onReply}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Reply
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply to this comment</TooltipContent>
        </Tooltip>

        {/* Hide / Unhide */}
        {capabilities.hide && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                onClick={handleHide}
              >
                {isHidden ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Unhide
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Hide
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isHidden
                ? "Make this comment visible to the public again"
                : "Hide this comment from public view"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Send Private Message */}
        {capabilities.sendPM && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1"
                onClick={handleOpenPM}
              >
                <Mail className="h-3.5 w-3.5" />
                Message
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send a private message to {displayName}</TooltipContent>
          </Tooltip>
        )}

        {/* Delete */}
        {capabilities.delete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>Permanently delete this comment from the platform</TooltipContent>
          </Tooltip>
        )}

        {/* Hidden badge indicator */}
        {isHidden && (
          <Badge variant="outline" className="text-[10px] px-1.5 ml-1 text-muted-foreground">
            <EyeOff className="h-2.5 w-2.5 mr-1" />
            Hidden
          </Badge>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Private Message Dialog */}
      <Dialog open={showPMDialog} onOpenChange={setShowPMDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Private Message to {displayName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={pmMessage}
              onChange={(e) => setPmMessage(e.target.value)}
              rows={5}
              placeholder="Write your message..."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent as a direct message on {platform}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPMDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendPM}
              disabled={!pmMessage.trim() || sendingPM}
            >
              {sendingPM ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
