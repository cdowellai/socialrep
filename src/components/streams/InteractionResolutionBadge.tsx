import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface InteractionResolutionBadgeProps {
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  onToggle: () => void;
  className?: string;
}

export function InteractionResolutionBadge({
  resolved,
  resolvedBy,
  resolvedAt,
  onToggle,
  className,
}: InteractionResolutionBadgeProps) {
  const [resolverName, setResolverName] = useState<string | null>(null);

  // Fetch resolver's name
  useEffect(() => {
    if (resolvedBy) {
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", resolvedBy)
        .single()
        .then(({ data }) => {
          if (data) {
            setResolverName(data.full_name || data.email || "Team Member");
          }
        });
    }
  }, [resolvedBy]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!resolved) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 px-2 text-xs gap-1", className)}
            onClick={onToggle}
          >
            <CheckCircle2 className="h-3 w-3" />
            Mark Resolved
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mark this interaction as resolved</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant="outline"
        className="bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/30"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Resolved
        {resolverName && (
          <span className="ml-1 font-normal">by {resolverName}</span>
        )}
      </Badge>
      {resolvedAt && (
        <span className="text-[10px] text-muted-foreground">
          {formatTime(resolvedAt)}
        </span>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onToggle}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reopen this interaction</TooltipContent>
      </Tooltip>
    </div>
  );
}
