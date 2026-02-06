import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ChatbotMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  sentiment: string | null;
  created_at: string;
}

export interface ChatbotConversation {
  id: string;
  user_id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  resolution_type: "bot" | "human" | "pending" | null;
  handed_off_at: string | null;
  interaction_id: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  messages?: ChatbotMessage[];
}

export interface ChatbotAnalytics {
  totalConversations: number;
  botResolutionRate: number;
  avgConversationLength: number;
  topQuestions: Array<{ question: string; count: number }>;
}

export function useChatbotConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatbotConversation | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("chatbot_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversations(data as ChatbotConversation[]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversations",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch all conversations
      const { data: convData, error: convError } = await supabase
        .from("chatbot_conversations")
        .select("id, resolution_type")
        .eq("user_id", user.id);

      if (convError) throw convError;

      // Fetch all messages to calculate averages and top questions
      const { data: msgData, error: msgError } = await supabase
        .from("chatbot_messages")
        .select("conversation_id, role, content")
        .in(
          "conversation_id",
          convData?.map((c) => c.id) || []
        );

      if (msgError) throw msgError;

      const totalConversations = convData?.length || 0;
      const botResolved = convData?.filter((c) => c.resolution_type === "bot").length || 0;
      const botResolutionRate = totalConversations > 0 ? (botResolved / totalConversations) * 100 : 0;

      // Calculate average messages per conversation
      const messagesByConversation: Record<string, number> = {};
      msgData?.forEach((msg) => {
        messagesByConversation[msg.conversation_id] = (messagesByConversation[msg.conversation_id] || 0) + 1;
      });
      const avgConversationLength =
        Object.keys(messagesByConversation).length > 0
          ? Object.values(messagesByConversation).reduce((a, b) => a + b, 0) / Object.keys(messagesByConversation).length
          : 0;

      // Get top questions (user messages)
      const questionCounts: Record<string, number> = {};
      msgData
        ?.filter((m) => m.role === "user")
        .forEach((msg) => {
          const normalized = msg.content.toLowerCase().trim().slice(0, 100);
          questionCounts[normalized] = (questionCounts[normalized] || 0) + 1;
        });

      const topQuestions = Object.entries(questionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([question, count]) => ({ question, count }));

      setAnalytics({
        totalConversations,
        botResolutionRate: Math.round(botResolutionRate),
        avgConversationLength: Math.round(avgConversationLength * 10) / 10,
        topQuestions,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
    fetchAnalytics();
  }, [fetchConversations, fetchAnalytics]);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      setSelectedConversation(conversation);
      setLoadingMessages(true);

      try {
        const { data, error } = await supabase
          .from("chatbot_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data as ChatbotMessage[]);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversation messages",
        });
      } finally {
        setLoadingMessages(false);
      }
    },
    [conversations, toast]
  );

  const updateConversationStatus = useCallback(
    async (conversationId: string, resolutionType: "bot" | "human" | "pending") => {
      try {
        const { error } = await supabase
          .from("chatbot_conversations")
          .update({ 
            resolution_type: resolutionType,
            status: resolutionType === "pending" ? "active" : "ended",
            ended_at: resolutionType !== "pending" ? new Date().toISOString() : null,
          })
          .eq("id", conversationId);

        if (error) throw error;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, resolution_type: resolutionType, status: resolutionType === "pending" ? "active" : "ended" }
              : c
          )
        );
        toast({
          title: "Status updated",
          description: "Conversation status has been updated",
        });
      } catch (error) {
        console.error("Error updating conversation:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update conversation status",
        });
      }
    },
    [toast]
  );

  return {
    conversations,
    selectedConversation,
    messages,
    analytics,
    loading,
    loadingMessages,
    selectConversation,
    updateConversationStatus,
    refetch: fetchConversations,
    clearSelection: () => {
      setSelectedConversation(null);
      setMessages([]);
    },
  };
}
