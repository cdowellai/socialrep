import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AggregatedStreamView } from "./AggregatedStreamView";
import { SingleStreamView } from "./SingleStreamView";
import { AddStreamDialog } from "./AddStreamDialog";
import { useStreams, type Stream } from "@/hooks/useStreams";
import { useStreamUnreadCounts } from "@/hooks/useStreamUnreadCounts";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface StreamBoardProps {
  onInteractionClick?: (interaction: Interaction) => void;
}

export function StreamBoard({ onInteractionClick }: StreamBoardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { streams, loading, updateStream, deleteStream } = useStreams();
  const { markStreamAsRead } = useStreamUnreadCounts(streams);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);

  // Check URL params for stream selection and edit mode
  const selectedStreamId = searchParams.get("stream");
  const shouldEdit = searchParams.get("edit") === "true";

  // Find selected stream
  const selectedStream = selectedStreamId
    ? streams.find((s) => s.id === selectedStreamId)
    : null;

  useEffect(() => {
    if (shouldEdit && selectedStreamId) {
      const stream = streams.find((s) => s.id === selectedStreamId);
      if (stream) {
        setEditingStream(stream);
        setShowAddDialog(true);
        // Clear edit param
        searchParams.delete("edit");
        setSearchParams(searchParams);
      }
    }
  }, [shouldEdit, selectedStreamId, streams]);

  // Mark stream as read when selected
  useEffect(() => {
    if (selectedStreamId) {
      markStreamAsRead(selectedStreamId);
    }
  }, [selectedStreamId]);

  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream);
    setShowAddDialog(true);
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
      // If we were viewing this stream, go back to aggregated view
      if (selectedStreamId === stream.id) {
        searchParams.delete("stream");
        setSearchParams(searchParams);
      }
    }
  };

  // Render single stream view if a stream is selected
  if (selectedStream) {
    return (
      <>
        <SingleStreamView
          stream={selectedStream}
          onEdit={handleEditStream}
          onDelete={handleDeleteStream}
          onInteractionClick={onInteractionClick}
        />
        <AddStreamDialog
          isOpen={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            setEditingStream(null);
          }}
          onSave={handleUpdateStream}
          editingStream={editingStream}
        />
      </>
    );
  }

  // Render aggregated view with all streams
  return (
    <>
      <AggregatedStreamView
        onInteractionClick={onInteractionClick}
        onEditStream={handleEditStream}
      />
      <AddStreamDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingStream(null);
        }}
        onSave={handleUpdateStream}
        editingStream={editingStream}
      />
    </>
  );
}
