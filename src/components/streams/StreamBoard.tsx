import { useState } from "react";
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  LayoutGrid,
  RefreshCw,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { StreamColumn } from "./StreamColumn";
import { AddStreamDialog } from "./AddStreamDialog";
import { useStreams, type Stream } from "@/hooks/useStreams";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface StreamBoardProps {
  onInteractionClick?: (interaction: Interaction) => void;
}

export function StreamBoard({ onInteractionClick }: StreamBoardProps) {
  const {
    streams,
    loading,
    createStream,
    updateStream,
    deleteStream,
    reorderStreams,
    toggleCollapse,
    refetch,
  } = useStreams();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderStreams(active.id as string, over.id as string);
    }
  };

  const handleCreateStream = async (data: any) => {
    await createStream(data);
  };

  const handleUpdateStream = async (data: any) => {
    if (editingStream) {
      await updateStream(editingStream.id, data);
      setEditingStream(null);
    }
  };

  const handleDeleteStream = async (stream: Stream) => {
    if (confirm(`Delete "${stream.name}"? This action cannot be undone.`)) {
      await deleteStream(stream.id);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-80 min-w-80 rounded-xl border bg-muted/30">
            <div className="p-3 border-b bg-card rounded-t-xl">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="p-2 space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Streams</h2>
          <span className="text-sm text-muted-foreground">
            ({streams.length} active)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all streams..."
              className="w-64 pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stream
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {streams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No streams yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Create streams to organize your interactions by platform, type, or
              custom filters. Each stream shows real-time activity.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Stream
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <SortableContext
              items={streams.map((s) => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-4 p-4 h-full items-start">
                {streams.map((stream) => (
                  <StreamColumn
                    key={stream.id}
                    stream={stream}
                    onEdit={(s) => {
                      setEditingStream(s);
                      setShowAddDialog(true);
                    }}
                    onDelete={handleDeleteStream}
                    onToggleCollapse={toggleCollapse}
                    onInteractionClick={onInteractionClick}
                  />
                ))}

                {/* Add Stream Button */}
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="flex flex-col items-center justify-center w-80 min-w-80 h-40 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Add Stream
                  </span>
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Dialogs */}
      <AddStreamDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingStream(null);
        }}
        onSave={editingStream ? handleUpdateStream : handleCreateStream}
        editingStream={editingStream}
      />
    </div>
  );
}
