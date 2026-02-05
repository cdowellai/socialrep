import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface InteractionReply {
  id: string;
  interaction_id: string;
  user_id: string;
  team_id: string | null;
  content: string;
  platform_reply_id: string | null;
  platform_status: "pending" | "sent" | "failed" | "not_connected";
  platform_error: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_email?: string;
  user_name?: string;
}

interface UseInteractionRepliesOptions {
  interactionId: string;
  enabled?: boolean;
}

export function useInteractionReplies({ interactionId, enabled = true }: UseInteractionRepliesOptions) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<InteractionReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchReplies = useCallback(async () => {
    if (!user || !interactionId || !enabled) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("interaction_replies")
        .select("*")
        .eq("interaction_id", interactionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch user info for each reply
      const repliesWithUsers = await Promise.all(
        (data || []).map(async (reply: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("user_id", reply.user_id)
            .single();

          return {
            ...reply,
            platform_status: reply.platform_status as InteractionReply["platform_status"],
            user_email: profile?.email || undefined,
            user_name: profile?.full_name || undefined,
          };
        })
      );

      setReplies(repliesWithUsers);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoading(false);
    }
  }, [user, interactionId, enabled]);

  // Send a reply
  const sendReply = useCallback(
    async (content: string, platform: string) => {
      if (!user || !interactionId) return null;

      setSending(true);
      try {
        // Get team_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("current_team_id")
          .eq("user_id", user.id)
          .single();

        // Insert reply to database
        const { data: reply, error: insertError } = await supabase
          .from("interaction_replies")
          .insert({
            interaction_id: interactionId,
            user_id: user.id,
            team_id: profile?.current_team_id || null,
            content,
            platform_status: "pending",
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Call edge function to send to platform
        const { data: platformResult, error: platformError } = await supabase.functions.invoke(
          "send-platform-reply",
          {
            body: {
              replyId: reply.id,
              interactionId,
              content,
              platform,
            },
          }
        );

        if (platformError) {
          // Update reply with error status
          await supabase
            .from("interaction_replies")
            .update({
              platform_status: "failed",
              platform_error: platformError.message,
            })
            .eq("id", reply.id);

          toast({
            title: "Reply saved locally",
            description: `Could not send to ${platform}: ${platformError.message}`,
            variant: "destructive",
          });
        } else if (platformResult?.success) {
          // Update reply with success status
          await supabase
            .from("interaction_replies")
            .update({
              platform_status: "sent",
              platform_reply_id: platformResult.platformReplyId,
            })
            .eq("id", reply.id);

          toast({
            title: "Reply sent",
            description: `Your reply was posted to ${platform}`,
          });
        } else if (platformResult?.notConnected) {
          await supabase
            .from("interaction_replies")
            .update({
              platform_status: "not_connected",
            })
            .eq("id", reply.id);

          toast({
            title: "Reply saved",
            description: `Connect your ${platform} account to post replies directly.`,
          });
        }

        await fetchReplies();
        return reply;
      } catch (error: any) {
        console.error("Error sending reply:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to send reply",
          variant: "destructive",
        });
        return null;
      } finally {
        setSending(false);
      }
    },
    [user, interactionId, fetchReplies, toast]
  );

  // Mark interaction as resolved
  const resolveInteraction = useCallback(
    async (interactionId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("interactions")
          .update({
            resolved: true,
            resolved_by: user.id,
            resolved_at: new Date().toISOString(),
          })
          .eq("id", interactionId);

        if (error) throw error;

        toast({
          title: "Marked as resolved",
          description: "This interaction has been marked as resolved.",
        });
        return true;
      } catch (error: any) {
        console.error("Error resolving interaction:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to resolve interaction",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Unresolve interaction
  const unresolveInteraction = useCallback(
    async (interactionId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("interactions")
          .update({
            resolved: false,
            resolved_by: null,
            resolved_at: null,
          })
          .eq("id", interactionId);

        if (error) throw error;

        toast({
          title: "Reopened",
          description: "This interaction has been reopened.",
        });
        return true;
      } catch (error: any) {
        console.error("Error unresolving interaction:", error);
        return false;
      }
    },
    [user, toast]
  );

  // Subscribe to realtime updates
  useEffect(() => {
    if (!interactionId || !enabled) return;

    const channel = supabase
      .channel(`replies-${interactionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interaction_replies",
          filter: `interaction_id=eq.${interactionId}`,
        },
        () => {
          fetchReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [interactionId, enabled, fetchReplies]);

  // Initial fetch
  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  return {
    replies,
    loading,
    sending,
    sendReply,
    resolveInteraction,
    unresolveInteraction,
    refetch: fetchReplies,
  };
}
