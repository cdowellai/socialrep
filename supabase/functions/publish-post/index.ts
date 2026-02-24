import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { postId } = await req.json();
    if (!postId) {
      return new Response(JSON.stringify({ error: "postId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get connected platforms for this user
    const { data: platforms, error: platformError } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (platformError || !platforms || platforms.length === 0) {
      return new Response(JSON.stringify({ error: "No connected platforms found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {};
    const postPlatforms: string[] = post.platforms || [];

    for (const platformName of postPlatforms) {
      // FIX: The column is `platform`, not `platform_type`
      const platform = platforms.find(
        (p: any) => p.platform === platformName && p.is_active
      );

      if (!platform) {
        results[platformName] = { success: false, error: `Platform ${platformName} not connected` };
        continue;
      }

      try {
        if (platformName === "facebook") {
          // Get page access token from platform metadata
          const pageToken = platform.access_token;
          const pageId = platform.platform_account_id;

          if (!pageToken || !pageId) {
            results[platformName] = { success: false, error: "Missing page token or page ID" };
            continue;
          }

          // Build the post body
          const postBody: Record<string, string> = {
            message: post.content,
            access_token: pageToken,
          };

          // Add link if present
          if (post.link_url) {
            postBody.link = post.link_url;
          }

          // Post to Facebook Graph API
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/feed`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(postBody),
            }
          );

          const fbData = await fbResponse.json();

          if (fbData.error) {
            results[platformName] = { success: false, error: fbData.error.message };
          } else {
            results[platformName] = { success: true, postId: fbData.id };
          }
        } else if (platformName === "instagram") {
          // Instagram publishing via Graph API
          const pageToken = platform.access_token;
          const igAccountId = platform.platform_account_id;

          if (!pageToken || !igAccountId) {
            results[platformName] = { success: false, error: "Missing Instagram account token or ID" };
            continue;
          }

          // Step 1: Create media container
          const containerBody: Record<string, string> = {
            caption: post.content,
            access_token: pageToken,
          };

          // If there's an image, use IMAGE type; otherwise use a default approach
          if (post.media_urls && post.media_urls.length > 0) {
            containerBody.image_url = post.media_urls[0];
            containerBody.media_type = "IMAGE";
          } else {
            // Text-only posts require a link or image on Instagram
            // Use the link if available
            if (post.link_url) {
              containerBody.image_url = post.link_url;
            } else {
              results[platformName] = {
                success: false,
                error: "Instagram requires an image or link for posts",
              };
              continue;
            }
          }

          const containerResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(containerBody),
            }
          );
          const containerData = await containerResponse.json();

          if (containerData.error) {
            results[platformName] = { success: false, error: containerData.error.message };
            continue;
          }

          // Step 2: Publish the container
          const publishResponse = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: containerData.id,
                access_token: pageToken,
              }),
            }
          );
          const publishData = await publishResponse.json();

          if (publishData.error) {
            results[platformName] = { success: false, error: publishData.error.message };
          } else {
            results[platformName] = { success: true, postId: publishData.id };
          }
        } else {
          results[platformName] = { success: false, error: `Platform ${platformName} not supported for publishing yet` };
        }
      } catch (err: any) {
        results[platformName] = { success: false, error: err.message || "Unknown error" };
      }
    }

    // Determine overall status
    const allSucceeded = Object.values(results).every((r) => r.success);
    const anySucceeded = Object.values(results).some((r) => r.success);
    const newStatus = allSucceeded ? "published" : anySucceeded ? "published" : "failed";
    const publishErrors: Record<string, string> = {};
    for (const [platform, result] of Object.entries(results)) {
      if (!result.success && result.error) {
        publishErrors[platform] = result.error;
      }
    }

    // Update post status in DB
    await supabase
      .from("scheduled_posts")
      .update({
        status: newStatus,
        published_at: anySucceeded ? new Date().toISOString() : null,
        publish_errors: publishErrors,
      })
      .eq("id", postId);

    return new Response(
      JSON.stringify({
        success: anySucceeded,
        results,
        status: newStatus,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("publish-post error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
