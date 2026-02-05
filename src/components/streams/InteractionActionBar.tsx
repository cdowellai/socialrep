import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  ExternalLink,
  Flag,
  Archive,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InteractionActionBarProps {
  replyCount: number;
  isLiked?: boolean;
  postUrl?: string | null;
  onToggleLike?: () => void;
  onToggleThread: () => void;
  onArchive?: () => void;
  onMarkResponded?: () => void;
  onEscalate?: () => void;
  className?: string;
}

export function InteractionActionBar({
  replyCount,
  isLiked = false,
  postUrl,
  onToggleLike,
  onToggleThread,
  onArchive,
  onMarkResponded,
  onEscalate,
  className,
}: InteractionActionBarProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    if (postUrl) {
      navigator.clipboard.writeText(postUrl);
      toast({ title: "Link copied", description: "Post link copied to clipboard" });
    }
  };

  return (
    <div className={cn("flex items-center gap-1 pt-2 border-t", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              isLiked && "text-red-500"
            )}
            onClick={onToggleLike}
          >
            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
            <span className="sr-only">Like</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Like</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={onToggleThread}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {replyCount > 0 && (
              <span className="tabular-nums">{replyCount}</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {replyCount > 0
            ? `View ${replyCount} ${replyCount === 1 ? "comment" : "comments"}`
            : "Reply"}
        </TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {postUrl && (
            <>
              <DropdownMenuItem onClick={() => window.open(postUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={onMarkResponded}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Responded
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEscalate}>
            <Flag className="h-4 w-4 mr-2" />
            Escalate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
