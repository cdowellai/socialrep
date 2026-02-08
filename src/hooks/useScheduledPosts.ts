import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type PostStatus = "draft" | "pending_approval" | "scheduled" | "publishing" | "published" | "failed" | "cancelled";

export interface ScheduledPost {
  id: string;
  user_id: string;
  team_id: string | null;
  content: string;
  media_urls: string[];
  link_url: string | null;
  link_preview: Record<string, unknown> | null;
  platforms: string[];
  platform_account_ids: string[];
  scheduled_for: string | null;
  timezone: string;
  is_recurring: boolean;
  recurrence_rule: Record<string, unknown> | null;
  optimal_time_enabled: boolean;
  ai_generated: boolean;
  source_interaction_id: string | null;
  predicted_engagement: {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
    confidence?: number;
  } | null;
  status: PostStatus;
  approval_required: boolean;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  platform_post_ids: Record<string, string>;
  publish_errors: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  content: string;
  media_urls?: string[];
  link_url?: string | null;
  platforms: string[];
  platform_account_ids?: string[];
  scheduled_for?: string | null;
  timezone?: string;
  is_recurring?: boolean;
  recurrence_rule?: Record<string, unknown> | null;
  optimal_time_enabled?: boolean;
  ai_generated?: boolean;
  source_interaction_id?: string | null;
  predicted_engagement?: Record<string, unknown> | null;
  status?: PostStatus;
  approval_required?: boolean;
}

export interface PostUsage {
  posts_used: number;
  period_start: string;
  period_end: string;
}

export function useScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<PostUsage | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUsage();
    }
  }, [user]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("scheduled_posts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_posts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPosts((prev) => [payload.new as ScheduledPost, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === (payload.new as ScheduledPost).id
                  ? (payload.new as ScheduledPost)
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((p) => p.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .order("scheduled_for", { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(post => ({
        ...post,
        media_urls: post.media_urls || [],
        platforms: post.platforms || [],
        platform_account_ids: post.platform_account_ids || [],
        platform_post_ids: (post.platform_post_ids as Record<string, string>) || {},
        publish_errors: (post.publish_errors as Record<string, string>) || {},
        predicted_engagement: post.predicted_engagement as ScheduledPost['predicted_engagement'],
        recurrence_rule: post.recurrence_rule as Record<string, unknown> | null,
        link_preview: post.link_preview as Record<string, unknown> | null,
      })) as ScheduledPost[];
      
      setPosts(transformedData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("get_user_post_usage", {
        p_user_id: user.id,
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setUsage(data[0] as PostUsage);
      } else {
        setUsage({ posts_used: 0, period_start: "", period_end: "" });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  };

  const createPost = async (input: CreatePostInput): Promise<ScheduledPost | null> => {
    if (!user) return null;

    try {
      const insertData = {
        user_id: user.id,
        content: input.content,
        media_urls: input.media_urls || [],
        link_url: input.link_url,
        platforms: input.platforms,
        platform_account_ids: input.platform_account_ids || [],
        scheduled_for: input.scheduled_for,
        timezone: input.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_recurring: input.is_recurring || false,
        recurrence_rule: input.recurrence_rule as unknown as null,
        optimal_time_enabled: input.optimal_time_enabled || false,
        ai_generated: input.ai_generated || false,
        source_interaction_id: input.source_interaction_id,
        predicted_engagement: input.predicted_engagement as unknown as null,
        status: input.status || "draft" as const,
        approval_required: input.approval_required || false,
      };

      const { data, error } = await supabase
        .from("scheduled_posts")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: input.scheduled_for ? "Post scheduled successfully" : "Draft saved",
      });

      // Increment usage if publishing
      if (input.status === "scheduled" || input.status === "publishing") {
        await supabase.rpc("increment_post_usage", { p_user_id: user.id });
        fetchUsage();
      }

      return data as ScheduledPost;
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePost = async (
    id: string,
    updates: Partial<CreatePostInput>
  ): Promise<boolean> => {
    try {
      // Clean up the updates to avoid type issues
      const cleanUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.content !== undefined) cleanUpdates.content = updates.content;
      if (updates.media_urls !== undefined) cleanUpdates.media_urls = updates.media_urls;
      if (updates.link_url !== undefined) cleanUpdates.link_url = updates.link_url;
      if (updates.platforms !== undefined) cleanUpdates.platforms = updates.platforms;
      if (updates.platform_account_ids !== undefined) cleanUpdates.platform_account_ids = updates.platform_account_ids;
      if (updates.scheduled_for !== undefined) cleanUpdates.scheduled_for = updates.scheduled_for;
      if (updates.timezone !== undefined) cleanUpdates.timezone = updates.timezone;
      if (updates.is_recurring !== undefined) cleanUpdates.is_recurring = updates.is_recurring;
      if (updates.recurrence_rule !== undefined) cleanUpdates.recurrence_rule = updates.recurrence_rule;
      if (updates.optimal_time_enabled !== undefined) cleanUpdates.optimal_time_enabled = updates.optimal_time_enabled;
      if (updates.ai_generated !== undefined) cleanUpdates.ai_generated = updates.ai_generated;
      if (updates.source_interaction_id !== undefined) cleanUpdates.source_interaction_id = updates.source_interaction_id;
      if (updates.predicted_engagement !== undefined) cleanUpdates.predicted_engagement = updates.predicted_engagement;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.approval_required !== undefined) cleanUpdates.approval_required = updates.approval_required;

      const { error } = await supabase
        .from("scheduled_posts")
        .update(cleanUpdates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated",
      });
      return true;
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Post removed",
      });
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      return false;
    }
  };

  const approvePost = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({
          status: "scheduled",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Approved",
        description: "Post approved and scheduled",
      });
      return true;
    } catch (error) {
      console.error("Error approving post:", error);
      return false;
    }
  };

  const rejectPost = async (id: string, reason: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({
          status: "draft",
          rejection_reason: reason,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Post sent back for revision",
      });
      return true;
    } catch (error) {
      console.error("Error rejecting post:", error);
      return false;
    }
  };

  const cancelPost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cancelled",
        description: "Scheduled post cancelled",
      });
      return true;
    } catch (error) {
      console.error("Error cancelling post:", error);
      return false;
    }
  };

  // Filter helpers
  const drafts = posts.filter((p) => p.status === "draft");
  const pendingApproval = posts.filter((p) => p.status === "pending_approval");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");
  const failed = posts.filter((p) => p.status === "failed");

  return {
    posts,
    drafts,
    pendingApproval,
    scheduled,
    published,
    failed,
    loading,
    usage,
    createPost,
    updatePost,
    deletePost,
    approvePost,
    rejectPost,
    cancelPost,
    refetch: fetchPosts,
  };
}
