import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Columns3,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Bell,
  BellOff,
  MoreHorizontal,
  Plus,
  Settings,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreams, type Stream } from "@/hooks/useStreams";
import { useStreamUnreadCounts } from "@/hooks/useStreamUnreadCounts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SortableStreamItemProps {
  stream: Stream;
  unreadCount: number;
  isActive: boolean;
  onToggleMute: (stream: Stream) => void;
}

function SortableStreamItem({
  stream,
  unreadCount,
  isActive,
  onToggleMute,
}: SortableStreamItemProps) {
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

  const isMuted = stream.notifications_muted;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50",
        isDragging && "opacity-50 shadow-lg bg-sidebar-accent"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      <Link
        to={`/dashboard/streams?stream=${stream.id}`}
        className="flex-1 flex items-center gap-2 min-w-0"
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: stream.color || "#6366f1" }}
        />
        <span className="text-sm truncate">{stream.name}</span>
      </Link>

      <div className="flex items-center gap-1">
        {!isMuted && unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="h-5 min-w-5 px-1.5 text-[10px] font-semibold"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}

        {isMuted && (
          <BellOff className="h-3 w-3 text-muted-foreground" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onToggleMute(stream)}>
              {isMuted ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Mute
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/streams?stream=${stream.id}&edit=true`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface StreamsSidebarMenuProps {
  collapsed?: boolean;
}

export function StreamsSidebarMenu({ collapsed = false }: StreamsSidebarMenuProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  const { streams, updateStream } = useStreams();
  const { unreadCounts, getTotalUnread, markStreamAsRead } = useStreamUnreadCounts(streams);

  // Sort streams by sidebar_position
  const sortedStreams = [...streams].sort(
    (a, b) => (a.sidebar_position ?? 0) - (b.sidebar_position ?? 0)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const isStreamsActive = location.pathname.includes("/streams");
  const activeStreamId = searchParams.get("stream");
  const totalUnread = getTotalUnread();

  // Mark stream as read when navigating to it
  useEffect(() => {
    if (activeStreamId) {
      markStreamAsRead(activeStreamId);
    }
  }, [activeStreamId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedStreams.findIndex((s) => s.id === active.id);
    const newIndex = sortedStreams.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the streams
    const reordered = [...sortedStreams];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed);

    // Update sidebar positions in database
    try {
      await Promise.all(
        reordered.map((stream, index) =>
          supabase
            .from("streams")
            .update({ sidebar_position: index })
            .eq("id", stream.id)
        )
      );
    } catch (error) {
      console.error("Error reordering streams:", error);
    }
  };

  const handleToggleMute = async (stream: Stream) => {
    const newMuted = !stream.notifications_muted;
    await updateStream(stream.id, { notifications_muted: newMuted });
    toast({
      title: newMuted ? "Notifications muted" : "Notifications enabled",
      description: `${stream.name} notifications ${newMuted ? "muted" : "unmuted"}.`,
    });
  };

  if (collapsed) {
    return (
      <Link
        to="/dashboard/streams"
        className={cn(
          "relative flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors",
          isStreamsActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <Columns3 className="h-5 w-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isStreamsActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Columns3 className="h-5 w-5" />
          <span className="flex-1 text-left">Streams</span>
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="h-5 min-w-5 px-1.5 text-[10px] font-semibold"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-1">
        {/* All Streams Link */}
        <Link
          to="/dashboard/streams"
          className={cn(
            "flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-md text-sm transition-colors",
            !activeStreamId && isStreamsActive
              ? "bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>All Streams</span>
        </Link>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sortedStreams.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.5 mt-1">
              {sortedStreams.map((stream) => (
                <SortableStreamItem
                  key={stream.id}
                  stream={stream}
                  unreadCount={unreadCounts[stream.id] || 0}
                  isActive={activeStreamId === stream.id}
                  onToggleMute={handleToggleMute}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sortedStreams.length === 0 && (
          <div className="pl-8 py-2">
            <span className="text-xs text-muted-foreground">No streams yet</span>
          </div>
        )}

        <Link
          to="/dashboard/streams"
          className="flex items-center gap-2 pl-6 pr-3 py-1.5 mt-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Stream
        </Link>
      </CollapsibleContent>
    </Collapsible>
  );
}
