import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Stream = Tables<"streams">;
export type StreamInsert = TablesInsert<"streams">;
export type StreamUpdate = TablesUpdate<"streams">;

export function useStreams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreams = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("streams-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "streams",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setStreams((prev) => [...prev, payload.new as Stream].sort((a, b) => a.position - b.position));
          } else if (payload.eventType === "UPDATE") {
            setStreams((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Stream) : s))
                .sort((a, b) => a.position - b.position)
            );
          } else if (payload.eventType === "DELETE") {
            setStreams((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createStream = async (data: Omit<StreamInsert, "user_id">) => {
    if (!user) return null;

    try {
      const maxPosition = Math.max(0, ...streams.map((s) => s.position));
      const { data: newStream, error } = await supabase
        .from("streams")
        .insert({
          ...data,
          user_id: user.id,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Stream created",
        description: `"${data.name}" has been added to your board.`,
      });

      return newStream;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create stream",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateStream = async (id: string, data: StreamUpdate) => {
    try {
      const { error } = await supabase
        .from("streams")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Stream updated",
        description: "Your changes have been saved.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stream",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteStream = async (id: string) => {
    try {
      const stream = streams.find((s) => s.id === id);
      const { error } = await supabase.from("streams").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Stream deleted",
        description: `"${stream?.name}" has been removed.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stream",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderStreams = async (activeId: string, overId: string) => {
    const oldIndex = streams.findIndex((s) => s.id === activeId);
    const newIndex = streams.findIndex((s) => s.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const reordered = [...streams];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed);

    // Update positions
    const updatedStreams = reordered.map((s, index) => ({
      ...s,
      position: index,
    }));

    setStreams(updatedStreams);

    // Batch update positions in database
    try {
      const updates = updatedStreams.map((s) =>
        supabase.from("streams").update({ position: s.position }).eq("id", s.id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error("Error reordering streams:", error);
      // Revert on error
      fetchStreams();
    }
  };

  const toggleCollapse = async (id: string) => {
    const stream = streams.find((s) => s.id === id);
    if (!stream) return;

    // Optimistic update
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_collapsed: !s.is_collapsed } : s))
    );

    await supabase
      .from("streams")
      .update({ is_collapsed: !stream.is_collapsed })
      .eq("id", id);
  };

  return {
    streams,
    loading,
    createStream,
    updateStream,
    deleteStream,
    reorderStreams,
    toggleCollapse,
    refetch: fetchStreams,
  };
}
