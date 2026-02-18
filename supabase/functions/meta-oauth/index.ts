import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const META_GRAPH_URL = "https://graph.facebook.com/v19.0";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const META_APP_ID = Deno.env.get("META_APP_ID");
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");

    if (!META_APP_ID || !META_APP_SECRET) {
      return new Response(
        JSON.stringify({ error: "Meta app credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "get_app_id": {
        return new Response(
          JSON.stringify({ app_id: META_APP_ID }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "exchange_code": {
        const { code, redirect_uri } = body;
        if (!code || !redirect_uri) {
          return new Response(
            JSON.stringify({ error: "code and redirect_uri are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokenUrl = `${META_GRAPH_URL}/oauth/access_token?client_id=${encodeURIComponent(META_APP_ID)}&redirect_uri=${encodeURIComponent(redirect_uri)}&client_secret=${encodeURIComponent(META_APP_SECRET)}&code=${encodeURIComponent(code)}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
          console.error("Token exchange error:", tokenData.error);
          return new Response(
            JSON.stringify({ error: "Failed to exchange authorization code", details: tokenData.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const shortLivedToken = tokenData.access_token;

        const longLivedUrl = `${META_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(META_APP_ID)}&client_secret=${encodeURIComponent(META_APP_SECRET)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;
        const longLivedRes = await fetch(longLivedUrl);
        const longLivedData = await longLivedRes.json();

        if (longLivedData.error) {
          console.error("Long-lived token error:", longLivedData.error);
          return new Response(
            JSON.stringify({ error: "Failed to get long-lived token", details: longLivedData.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const longLivedToken = longLivedData.access_token;

        const pagesRes = await fetch(
          `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,picture{url}&access_token=${encodeURIComponent(longLivedToken)}`
        );
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
          console.error("Pages fetch error:", pagesData.error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch pages", details: pagesData.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const pages = (pagesData.data || []).map((page: any) => ({
          id: page.id,
          name: page.name,
          access_token: page.access_token,
          picture_url: page.picture?.data?.url || null,
        }));

        console.log(`Found ${pages.length} Facebook Pages for user ${user.id}`);

        return new Response(
          JSON.stringify({ success: true, user_token: longLivedToken, pages }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "connect_pages": {
        const { pages } = body;
        if (!pages || !Array.isArray(pages) || pages.length === 0) {
          return new Response(
            JSON.stringify({ error: "pages array is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const connected = [];

        for (const page of pages) {
          const { data: fbConn, error: fbErr } = await supabase
            .from("connected_platforms")
            .upsert(
              {
                user_id: user.id,
                platform: "facebook",
                platform_account_id: page.id,
                platform_account_name: page.name,
                access_token: page.access_token,
                is_active: true,
                last_synced_at: new Date().toISOString(),
              },
              { onConflict: "user_id,platform,platform_account_id" }
            )
            .select()
            .single();

          if (fbErr) {
            console.error("Error storing FB page:", fbErr);
          } else {
            connected.push({ platform: "facebook", ...fbConn });
            console.log(`Connected Facebook Page: ${page.name} (${page.id})`);
          }
        }

        for (const page of pages) {
          try {
            const subscribeRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(page.id)}/subscribed_apps`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscribed_fields: "feed,messages,message_deliveries",
                  access_token: page.access_token,
                }),
              }
            );
            const subscribeData = await subscribeRes.json();
            console.log(`Webhook subscription for page ${page.id}:`, JSON.stringify(subscribeData));
          } catch (err) {
            console.error(`Failed to subscribe page ${page.id} to webhooks:`, err);
          }
        }

        return new Response(
          JSON.stringify({ success: true, connected }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "subscribe_webhooks": {
        const { data: platforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "facebook")
          .eq("is_active", true);

        if (!platforms || platforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Facebook pages found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const results = [];
        for (const platform of platforms) {
          if (!platform.access_token || !platform.platform_account_id) continue;

          try {
            const subscribeRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(platform.platform_account_id)}/subscribed_apps`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscribed_fields: "feed,messages,message_deliveries",
                  access_token: platform.access_token,
                }),
              }
            );
            const subscribeData = await subscribeRes.json();
            console.log(`Webhook subscription for ${platform.platform_account_name}:`, JSON.stringify(subscribeData));
            results.push({
              page: platform.platform_account_name,
              success: subscribeData.success === true,
              details: subscribeData,
            });
          } catch (err) {
            console.error(`Failed to subscribe ${platform.platform_account_name}:`, err);
            results.push({
              page: platform.platform_account_name,
              success: false,
              error: String(err),
            });
          }
        }

        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "test_connection": {
        // Step 1: Get all connected Facebook pages for this user
        const { data: platforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "facebook")
          .eq("is_active", true);

        if (!platforms || platforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Facebook pages found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const results = [];

        for (const platform of platforms) {
          const pageId = platform.platform_account_id;
          const pageToken = platform.access_token;

          if (!pageId || !pageToken) {
            results.push({ page: platform.platform_account_name, error: "Missing token or page ID" });
            continue;
          }

          // Test the page token by fetching page info
          const meRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}?fields=id,name&access_token=${encodeURIComponent(pageToken)}`
          );
          const meData = await meRes.json();

          if (meData.error) {
            results.push({
              page: platform.platform_account_name,
              error: meData.error.message || "Token verification failed",
              token_valid: false,
            });
            continue;
          }

          // Fetch feed to count posts and comments
          const feedRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/feed?fields=id,message,from,created_time,comments.limit(25){id,message,from,created_time}&limit=25&access_token=${encodeURIComponent(pageToken)}`
          );
          const feedData = await feedRes.json();

          let postCount = 0;
          let commentCount = 0;
          if (!feedData.error && feedData.data) {
            postCount = feedData.data.length;
            for (const post of feedData.data) {
              commentCount += post.comments?.data?.length || 0;
            }
          }

          results.push({
            page: platform.platform_account_name,
            page_id: pageId,
            token_valid: true,
            posts_found: postCount,
            comments_found: commentCount,
            feed_error: feedData.error?.message || null,
          });
        }

        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_interactions": {
        const { data: platforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "facebook")
          .eq("is_active", true);

        if (!platforms || platforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Facebook pages found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[sync] Starting sync for ${platforms.length} connected Facebook page(s)`);

        let totalComments = 0;
        let totalMessages = 0;
        let newComments = 0;
        let newMessages = 0;
        let syncErrors = 0;

        for (const platform of platforms) {
          if (!platform.access_token || !platform.platform_account_id) continue;

          const pageId = platform.platform_account_id;
          const pageToken = platform.access_token;

          // 1. Fetch posts + comments
          console.log(`[sync] Fetching feed for page ${pageId}...`);
          const feedRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/feed?fields=id,message,from,created_time,comments.limit(100){id,message,from,created_time,parent}&limit=25&access_token=${encodeURIComponent(pageToken)}`
          );
          const feedData = await feedRes.json();

          if (feedData.error) {
            console.error(`[sync] Feed error for page ${pageId}:`, JSON.stringify(feedData.error));
            syncErrors++;
          } else {
            for (const post of feedData.data || []) {
              if (!post.comments?.data) continue;
              for (const comment of post.comments.data) {
                totalComments++;
                // Check if already exists
                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", comment.id)
                  .eq("user_id", user.id)
                  .maybeSingle();

                if (existing) continue;

                const { error: insertErr } = await supabase
                  .from("interactions")
                  .insert({
                    user_id: user.id,
                    external_id: comment.id,
                    platform: "facebook",
                    interaction_type: "comment",
                    content: comment.message || "",
                    author_name: comment.from?.name || "Unknown",
                    author_handle: comment.from?.id || null,
                    post_url: `https://facebook.com/${post.id}`,
                    created_at: comment.created_time,
                    status: "pending",
                  });

                if (insertErr) {
                  // Ignore duplicate key errors (race condition)
                  if (!insertErr.message?.includes("duplicate")) {
                    console.error("[sync] Insert comment error:", JSON.stringify(insertErr));
                    syncErrors++;
                  }
                } else {
                  newComments++;
                }
              }
            }
          }

          // 2. Fetch conversations (DMs)
          console.log(`[sync] Fetching conversations for page ${pageId}...`);
          const convoRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/conversations?fields=id,participants,messages.limit(25){id,message,from,created_time}&limit=25&access_token=${encodeURIComponent(pageToken)}`
          );
          const convoData = await convoRes.json();

          if (convoData.error) {
            console.error(`[sync] Conversations error for page ${pageId}:`, JSON.stringify(convoData.error));
            // DM permission may not be granted — don't count as fatal error
          } else {
            for (const convo of convoData.data || []) {
              if (!convo.messages?.data) continue;
              for (const msg of convo.messages.data) {
                totalMessages++;
                const msgExternalId = msg.id || `dm_${convo.id}_${msg.created_time}`;

                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", msgExternalId)
                  .eq("user_id", user.id)
                  .maybeSingle();

                if (existing) continue;

                const { error: insertErr } = await supabase
                  .from("interactions")
                  .insert({
                    user_id: user.id,
                    external_id: msgExternalId,
                    platform: "facebook",
                    interaction_type: "dm",
                    content: msg.message || "",
                    author_name: msg.from?.name || "Unknown",
                    author_handle: msg.from?.id || null,
                    created_at: msg.created_time,
                    status: "pending",
                    metadata: { conversation_id: convo.id },
                  });

                if (insertErr) {
                  if (!insertErr.message?.includes("duplicate")) {
                    console.error("[sync] Insert DM error:", JSON.stringify(insertErr));
                    syncErrors++;
                  }
                } else {
                  newMessages++;
                }
              }
            }
          }

          // Update last_synced_at
          await supabase
            .from("connected_platforms")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", platform.id);
        }

        const summary = {
          success: true,
          new_comments: newComments,
          new_messages: newMessages,
          total_comments_found: totalComments,
          total_messages_found: totalMessages,
          errors: syncErrors,
          synced_at: new Date().toISOString(),
        };

        console.log(`[sync] Complete:`, JSON.stringify(summary));

        return new Response(
          JSON.stringify(summary),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "post_reply": {
        const { interaction_id, message, platform: replyPlatform } = body;
        if (!interaction_id || !message) {
          return new Response(
            JSON.stringify({ error: "interaction_id and message required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: interaction } = await supabase
          .from("interactions")
          .select("*")
          .eq("id", interaction_id)
          .eq("user_id", user.id)
          .single();

        if (!interaction) {
          return new Response(
            JSON.stringify({ error: "Interaction not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: platformConn } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", interaction.platform)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (!platformConn?.access_token) {
          return new Response(
            JSON.stringify({ error: "No active platform connection found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let replyResult;

        if (interaction.interaction_type === "comment") {
          // Reply to comment
          console.log(`[reply] Posting comment reply to ${interaction.external_id}`);
          const replyRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(interaction.external_id!)}/comments`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message,
                access_token: platformConn.access_token,
              }),
            }
          );
          replyResult = await replyRes.json();
        } else if (interaction.interaction_type === "dm") {
          // Reply to DM — use the conversation_id from metadata if available
          const conversationId = (interaction.metadata as any)?.conversation_id;
          const recipientId = interaction.author_handle;

          if (conversationId) {
            console.log(`[reply] Sending DM reply to conversation ${conversationId}`);
            const replyRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(platformConn.platform_account_id!)}/messages`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipient: { id: recipientId },
                  message: { text: message },
                  access_token: platformConn.access_token,
                }),
              }
            );
            replyResult = await replyRes.json();
          } else {
            console.log(`[reply] Sending DM to recipient ${recipientId}`);
            const replyRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(platformConn.platform_account_id!)}/messages`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipient: { id: recipientId },
                  message: { text: message },
                  access_token: platformConn.access_token,
                }),
              }
            );
            replyResult = await replyRes.json();
          }
        }

        if (replyResult?.error) {
          console.error("[reply] Error:", JSON.stringify(replyResult.error));
          return new Response(
            JSON.stringify({ error: "Failed to post reply", details: replyResult.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update interaction status to responded
        await supabase
          .from("interactions")
          .update({
            status: "responded",
            resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
            response: message,
            responded_at: new Date().toISOString(),
          })
          .eq("id", interaction_id);

        console.log(`[reply] Success, FB reply ID: ${replyResult?.id || replyResult?.message_id}`);

        return new Response(
          JSON.stringify({ success: true, reply_id: replyResult?.id || replyResult?.message_id }),
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
    console.error("meta-oauth error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
