import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseChatbotOptions {
  onError?: (error: string) => void;
}

export function useChatbot(options: UseChatbotOptions = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const visitorIdRef = useRef<string>(generateVisitorId());

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user?.id || !content.trim()) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      let assistantContent = "";
      const assistantId = crypto.randomUUID();

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      try {
        const chatMessages = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        chatMessages.push({ role: "user" as const, content: content.trim() });

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: chatMessages,
              userId: user.id,
              conversationId,
              visitorId: visitorIdRef.current,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        // Get conversation ID from header
        const newConversationId = response.headers.get("X-Conversation-Id");
        if (newConversationId && !conversationId) {
          setConversationId(newConversationId);
        }

        // Stream the response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                );
              }
            } catch {
              // Put back incomplete JSON
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // Final flush
        if (buffer.trim()) {
          for (let raw of buffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                );
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        options.onError?.(message);
        // Remove empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, messages, conversationId, options]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    visitorIdRef.current = generateVisitorId();
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    conversationId,
  };
}

function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
