import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  MoreHorizontal,
  Settings,
  Trash2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamCard } from "./StreamCard";
import { useStreamInteractions } from "@/hooks/useStreamInteractions";
import type { Stream } from "@/hooks/useStreams";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface StreamColumnProps {
  stream: Stream;
  onEdit: (stream: Stream) => void;
  onDelete: (stream: Stream) => void;
  onToggleCollapse: (id: string) => void;
  onInteractionClick?: (interaction: Interaction) => void;
}

export function StreamColumn({
  stream,
  onEdit,
  onDelete,
  onToggleCollapse,
  onInteractionClick,
}: StreamColumnProps) {
  const { interactions, loading, hasMore, refetch } = useStreamInteractions({
    stream,
    limit: 50,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stream.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const interactionCount = interactions.length;
  const urgentCount = interactions.filter((i) => (i.urgency_score || 0) >= 7).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col rounded-xl border bg-muted/30 transition-all",
        stream.is_collapsed ? "w-12" : "w-80 min-w-80",
        isDragging && "opacity-50 shadow-xl"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2 p-3 border-b bg-card rounded-t-xl",
          stream.is_collapsed && "flex-col p-2"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {stream.is_collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onToggleCollapse(stream.id)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stream.color || "#6366f1" }}
                />
                <h3 className="font-semibold text-sm truncate">{stream.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {interactionCount} items
                </span>
                {urgentCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 h-4">
                    {urgentCount} urgent
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {stream.show_ai_suggestions && (
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onToggleCollapse(stream.id)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(stream)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Stream
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(stream)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Stream
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {!stream.is_collapsed && (
        <ScrollArea className="flex-1 max-h-[calc(100vh-220px)]">
          <div className="p-2 space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))
            ) : interactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p className="text-sm">No interactions yet</p>
                <p className="text-xs mt-1">New activity will appear here</p>
              </div>
            ) : (
              interactions.map((interaction) => (
                <StreamCard
                  key={interaction.id}
                  interaction={interaction}
                  showAiSuggestions={stream.show_ai_suggestions ?? true}
                  onReply={() => onInteractionClick?.(interaction)}
                />
              ))
            )}

            {hasMore && !loading && (
              <div className="p-2 text-center">
                <span className="text-xs text-muted-foreground">
                  Scroll for more...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Collapsed vertical text */}
      {stream.is_collapsed && (
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-xs font-medium writing-mode-vertical"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
            }}
          >
            {stream.name}
          </span>
        </div>
      )}
    </div>
  );
}
