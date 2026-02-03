import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation
interface ValidationError {
  field: string;
  message: string;
}

function validateString(
  value: unknown,
  field: string,
  options: { required?: boolean; maxLength?: number; enum?: string[]; pattern?: RegExp } = {}
): ValidationError | null {
  const { required = false, maxLength, enum: allowedValues, pattern } = options;

  if (value === undefined || value === null || value === "") {
    if (required) return { field, message: `${field} is required` };
    return null;
  }

  if (typeof value !== "string") {
    return { field, message: `${field} must be a string` };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }

  if (allowedValues && !allowedValues.includes(value)) {
    return { field, message: `${field} must be one of: ${allowedValues.join(", ")}` };
  }

  if (pattern && !pattern.test(value)) {
    return { field, message: `${field} has invalid format` };
  }

  return null;
}

// Pattern for alphanumeric IDs (Facebook/Meta IDs)
const META_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

interface MetaRequestBody {
  action: "fetch_comments" | "fetch_dms" | "post_reply" | "verify_token";
  accessToken?: string;
  pageId?: string;
  postId?: string;
  message?: string;
  commentId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check request size
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 50 * 1024) {
      return new Response(
        JSON.stringify({ error: "Request body too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON body
    let body: MetaRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, accessToken, pageId, postId, message, commentId } = body;

    // Input validation
    const validationErrors: ValidationError[] = [];

    const actionErr = validateString(action, "action", { 
      required: true, 
      enum: ["fetch_comments", "fetch_dms", "post_reply", "verify_token"] 
    });
    if (actionErr) validationErrors.push(actionErr);

    const accessTokenErr = validateString(accessToken, "accessToken", { maxLength: 500 });
    if (accessTokenErr) validationErrors.push(accessTokenErr);

    const pageIdErr = validateString(pageId, "pageId", { maxLength: 100, pattern: META_ID_PATTERN });
    if (pageIdErr) validationErrors.push(pageIdErr);

    const postIdErr = validateString(postId, "postId", { maxLength: 100, pattern: META_ID_PATTERN });
    if (postIdErr) validationErrors.push(postIdErr);

    const messageErr = validateString(message, "message", { maxLength: 8000 });
    if (messageErr) validationErrors.push(messageErr);

    const commentIdErr = validateString(commentId, "commentId", { maxLength: 100, pattern: META_ID_PATTERN });
    if (commentIdErr) validationErrors.push(commentIdErr);

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get stored access token from connected_platforms if not provided
    let metaAccessToken = accessToken;
    if (!metaAccessToken) {
      const { data: platform } = await supabase
        .from("connected_platforms")
        .select("access_token")
        .eq("user_id", user.id)
        .in("platform", ["facebook", "instagram"])
        .eq("is_active", true)
        .single();
      
      metaAccessToken = platform?.access_token;
    }

    if (!metaAccessToken) {
      return new Response(
        JSON.stringify({ 
          error: "Meta access token not found. Please connect your Facebook/Instagram account.",
          requiresAuth: true 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const META_GRAPH_URL = "https://graph.facebook.com/v18.0";

    switch (action) {
      case "verify_token": {
        // Verify the access token is valid
        const response = await fetch(`${META_GRAPH_URL}/me?access_token=${encodeURIComponent(metaAccessToken)}`);
        const data = await response.json();
        
        if (data.error) {
          return new Response(
            JSON.stringify({ error: "Token verification failed", valid: false }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ valid: true, userId: data.id, name: data.name }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "fetch_comments": {
        if (!pageId) {
          return new Response(
            JSON.stringify({ error: "pageId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch posts from page
        const postsResponse = await fetch(
          `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/posts?fields=id,message,created_time,comments{id,message,from,created_time}&access_token=${encodeURIComponent(metaAccessToken)}`
        );
        const postsData = await postsResponse.json();

        if (postsData.error) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch comments" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Transform comments into interactions format
        const interactions = [];
        for (const post of postsData.data || []) {
          if (post.comments?.data) {
            for (const comment of post.comments.data) {
              interactions.push({
                external_id: comment.id,
                platform: "facebook",
                interaction_type: "comment",
                content: comment.message,
                author_name: comment.from?.name,
                author_handle: comment.from?.id,
                post_url: `https://facebook.com/${post.id}`,
                created_at: comment.created_time,
              });
            }
          }
        }

        return new Response(
          JSON.stringify({ interactions, raw: postsData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "fetch_dms": {
        if (!pageId) {
          return new Response(
            JSON.stringify({ error: "pageId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch conversations (DMs)
        const conversationsResponse = await fetch(
          `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/conversations?fields=participants,messages{message,from,created_time}&access_token=${encodeURIComponent(metaAccessToken)}`
        );
        const conversationsData = await conversationsResponse.json();

        if (conversationsData.error) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch messages" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Transform DMs into interactions format
        const interactions = [];
        for (const conversation of conversationsData.data || []) {
          if (conversation.messages?.data) {
            for (const dm of conversation.messages.data) {
              interactions.push({
                external_id: dm.id,
                platform: "facebook",
                interaction_type: "dm",
                content: dm.message,
                author_name: dm.from?.name,
                author_handle: dm.from?.id,
                created_at: dm.created_time,
              });
            }
          }
        }

        return new Response(
          JSON.stringify({ interactions, raw: conversationsData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "post_reply": {
        if (!commentId || !message) {
          return new Response(
            JSON.stringify({ error: "commentId and message are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Post a reply to a comment
        const replyResponse = await fetch(
          `${META_GRAPH_URL}/${encodeURIComponent(commentId)}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: message,
              access_token: metaAccessToken,
            }),
          }
        );
        const replyData = await replyResponse.json();

        if (replyData.error) {
          return new Response(
            JSON.stringify({ error: "Failed to post reply" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, replyId: replyData.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("meta-integration error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
