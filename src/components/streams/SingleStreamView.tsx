import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Settings,
  RefreshCw,
  Loader2,
  LayoutGrid,
  Bell,
  BellOff,
  Trash2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { StreamCard } from "./StreamCard";
import { StreamFilterBar, type StreamFilters } from "./StreamFilterBar";
import { StreamBreadcrumb } from "./StreamBreadcrumb";
import { useStreamInteractions } from "@/hooks/useStreamInteractions";
import { useStreams, type Stream } from "@/hooks/useStreams";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface SingleStreamViewProps {
  stream: Stream;
  onEdit: (stream: Stream) => void;
  onDelete: (stream: Stream) => void;
  onInteractionClick?: (interaction: Interaction) => void;
}

export function SingleStreamView({
  stream,
  onEdit,
  onDelete,
  onInteractionClick,
}: SingleStreamViewProps) {
  const navigate = useNavigate();
  const { updateStream } = useStreams();
  const { interactions, loading, refetch } = useStreamInteractions({
    stream,
    limit: 100,
  });

  const [filters, setFilters] = useState<StreamFilters>({
    search: "",
    sentiment: "all",
    status: "all",
    minUrgency: 0,
    showAiDraftsOnly: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Keyboard navigation - Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInInput = target?.closest?.("input, textarea, [role='dialog']");
      if (e.key === "Escape" && !isInInput) {
        navigate("/dashboard/streams");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Apply local filters to interactions
  const filteredInteractions = useMemo(() => {
    return interactions.filter((interaction) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          interaction.content?.toLowerCase().includes(searchLower) ||
          interaction.author_name?.toLowerCase().includes(searchLower) ||
          interaction.author_handle?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Sentiment filter
      if (filters.sentiment !== "all" && interaction.sentiment !== filters.sentiment) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && interaction.status !== filters.status) {
        return false;
      }

      // Urgency filter
      if (filters.minUrgency > 0 && (interaction.urgency_score || 0) < filters.minUrgency) {
        return false;
      }

      // AI drafts filter
      if (filters.showAiDraftsOnly && interaction.status !== "pending") {
        return false;
      }

      return true;
    });
  }, [interactions, filters]);

  const urgentCount = filteredInteractions.filter(
    (i) => (i.urgency_score || 0) >= 7
  ).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleAiPrioritization = async (enabled: boolean) => {
    await updateStream(stream.id, { auto_sort_by_urgency: enabled });
  };

  const handleToggleMute = async () => {
    await updateStream(stream.id, {
      notifications_muted: !stream.notifications_muted,
    });
  };

  // Sort interactions by urgency if enabled
  const sortedInteractions = useMemo(() => {
    if (stream.auto_sort_by_urgency) {
      return [...filteredInteractions].sort(
        (a, b) =>
          (b.urgency_score || 0) - (a.urgency_score || 0) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return filteredInteractions;
  }, [filteredInteractions, stream.auto_sort_by_urgency]);

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b bg-card">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 flex-shrink-0">
                  <Link to="/dashboard/streams">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex items-center gap-1.5">
                  <span>Back to All Streams</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Esc</kbd>
                </div>
              </TooltipContent>
            </Tooltip>
            <StreamBreadcrumb stream={stream} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="hidden sm:flex"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="sm:hidden h-8 w-8"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Settings className="h-4 w-4" />
                  <span className="ml-2">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(stream)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Stream
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleMute}>
                  {stream.notifications_muted ? (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Mute Notifications
                    </>
                  )}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(stream)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Stream
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleMute}>
                  {stream.notifications_muted ? (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Mute Notifications
                    </>
                  )}
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
        </div>

        {/* Stream Info */}
        <div className="flex items-center gap-2 pl-11">
          {stream.platform && (
            <Badge variant="outline" className="capitalize text-xs">
              {stream.platform}
            </Badge>
          )}
          {stream.interaction_types?.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border-b bg-muted/30">
        <StreamFilterBar
          stream={stream}
          filters={filters}
          onFiltersChange={setFilters}
          interactionCount={filteredInteractions.length}
          urgentCount={urgentCount}
          onToggleAiPrioritization={handleToggleAiPrioritization}
        />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInteractions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No interactions found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {filters.search || filters.sentiment !== "all" || filters.status !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "New activity matching this stream's filters will appear here."}
              </p>
              {(filters.search || filters.sentiment !== "all" || filters.status !== "all") && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      search: "",
                      sentiment: "all",
                      status: "all",
                      minUrgency: 0,
                      showAiDraftsOnly: false,
                    })
                  }
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {sortedInteractions.map((interaction) => (
                <StreamCard
                  key={interaction.id}
                  interaction={interaction}
                  showAiSuggestions={stream.show_ai_suggestions ?? true}
                  onReply={() => onInteractionClick?.(interaction)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
