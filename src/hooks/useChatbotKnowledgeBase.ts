import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface KnowledgeBaseEntry {
  id: string;
  user_id: string;
  entry_type: "faq" | "qa_pair" | "document";
  title: string | null;
  question: string | null;
  answer: string | null;
  content: string | null;
  source_filename: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useChatbotKnowledgeBase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("chatbot_knowledge_base")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data as KnowledgeBaseEntry[]);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load knowledge base entries",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addFAQContent = useCallback(
    async (title: string, content: string) => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("chatbot_knowledge_base")
          .insert({
            user_id: user.id,
            entry_type: "faq",
            title,
            content,
          })
          .select()
          .single();

        if (error) throw error;
        setEntries((prev) => [data as KnowledgeBaseEntry, ...prev]);
        toast({
          title: "FAQ added",
          description: "Your FAQ content has been saved",
        });
        return data;
      } catch (error) {
        console.error("Error adding FAQ:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add FAQ content",
        });
      }
    },
    [user?.id, toast]
  );

  const addQAPair = useCallback(
    async (question: string, answer: string) => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("chatbot_knowledge_base")
          .insert({
            user_id: user.id,
            entry_type: "qa_pair",
            question,
            answer,
          })
          .select()
          .single();

        if (error) throw error;
        setEntries((prev) => [data as KnowledgeBaseEntry, ...prev]);
        toast({
          title: "Q&A pair added",
          description: "Your question and answer have been saved",
        });
        return data;
      } catch (error) {
        console.error("Error adding Q&A pair:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add Q&A pair",
        });
      }
    },
    [user?.id, toast]
  );

  const addDocumentContent = useCallback(
    async (filename: string, content: string) => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("chatbot_knowledge_base")
          .insert({
            user_id: user.id,
            entry_type: "document",
            source_filename: filename,
            content,
          })
          .select()
          .single();

        if (error) throw error;
        setEntries((prev) => [data as KnowledgeBaseEntry, ...prev]);
        toast({
          title: "Document added",
          description: `Content from ${filename} has been saved`,
        });
        return data;
      } catch (error) {
        console.error("Error adding document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add document content",
        });
      }
    },
    [user?.id, toast]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<Pick<KnowledgeBaseEntry, "title" | "content" | "question" | "answer" | "is_active">>) => {
      try {
        const { data, error } = await supabase
          .from("chatbot_knowledge_base")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? (data as KnowledgeBaseEntry) : e))
        );
        toast({
          title: "Entry updated",
          description: "Your knowledge base entry has been updated",
        });
      } catch (error) {
        console.error("Error updating entry:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update entry",
        });
      }
    },
    [toast]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("chatbot_knowledge_base")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast({
          title: "Entry deleted",
          description: "Your knowledge base entry has been removed",
        });
      } catch (error) {
        console.error("Error deleting entry:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete entry",
        });
      }
    },
    [toast]
  );

  return {
    entries,
    loading,
    addFAQContent,
    addQAPair,
    addDocumentContent,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
