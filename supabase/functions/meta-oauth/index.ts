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

        // Step 1: Exchange code for short-lived token
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

        // Step 2: Exchange for long-lived token (60 days)
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

        // Step 3: Fetch user's Facebook Pages (these return PAGE access tokens, not user tokens)
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

        // The access_token in each page object is the PAGE Access Token (not user token)
        const pages = (pagesData.data || []).map((page: any) => ({
          id: page.id,
          name: page.name,
          access_token: page.access_token, // This IS the Page Access Token
          picture_url: page.picture?.data?.url || null,
        }));

        console.log(`Found ${pages.length} Facebook Pages for user ${user.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            user_token: longLivedToken,
            pages,
          }),
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
          // Store Facebook Page connection with the PAGE access token
          const { data: fbConn, error: fbErr } = await supabase
            .from("connected_platforms")
            .upsert(
              {
                user_id: user.id,
                platform: "facebook",
                platform_account_id: page.id,
                platform_account_name: page.name,
                access_token: page.access_token, // Page Access Token
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

        // Subscribe pages to webhooks
        const supabaseProjectUrl = Deno.env.get("SUPABASE_URL")!;
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
        // Manually subscribe all connected pages to webhooks
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

      case "sync_interactions": {
        // Fetch interactions from connected Facebook pages
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

        console.log(`Starting sync for ${platforms.length} connected Facebook page(s)`);

        const allInteractions = [];

        for (const platform of platforms) {
          if (!platform.access_token || !platform.platform_account_id) {
            console.log(`Skipping platform ${platform.id}: missing token or account ID`);
            continue;
          }

          const pageId = platform.platform_account_id;
          const pageToken = platform.access_token;

          // 1. Fetch page feed (posts + comments) using the PAGE token
          console.log(`Fetching feed for page ${pageId}...`);
          const feedRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/feed?fields=id,message,from,created_time,comments{id,message,from,created_time}&limit=25&access_token=${encodeURIComponent(pageToken)}`
          );
          const feedData = await feedRes.json();

          if (feedData.error) {
            console.error(`Feed fetch error for page ${pageId}:`, JSON.stringify(feedData.error));
          } else {
            console.log(`Feed response for page ${pageId}: ${feedData.data?.length || 0} posts`);
            for (const post of feedData.data || []) {
              if (post.comments?.data) {
                console.log(`Post ${post.id}: ${post.comments.data.length} comments`);
                for (const comment of post.comments.data) {
                  allInteractions.push({
                    user_id: user.id,
                    external_id: comment.id,
                    platform: "facebook" as const,
                    interaction_type: "comment" as const,
                    content: comment.message || "",
                    author_name: comment.from?.name || "Unknown",
                    author_handle: comment.from?.id || null,
                    post_url: `https://facebook.com/${post.id}`,
                    created_at: comment.created_time,
                    status: "pending" as const,
                  });
                }
              }
            }
          }

          // 2. Fetch page conversations (DMs) using the PAGE token
          console.log(`Fetching conversations for page ${pageId}...`);
          const convoRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/conversations?fields=participants,messages.limit(10){message,from,created_time}&limit=25&access_token=${encodeURIComponent(pageToken)}`
          );
          const convoData = await convoRes.json();

          if (convoData.error) {
            console.error(`Conversations fetch error for page ${pageId}:`, JSON.stringify(convoData.error));
          } else {
            console.log(`Conversations response for page ${pageId}: ${convoData.data?.length || 0} conversations`);
            for (const convo of convoData.data || []) {
              if (convo.messages?.data) {
                for (const msg of convo.messages.data) {
                  allInteractions.push({
                    user_id: user.id,
                    external_id: msg.id || `dm_${Date.now()}_${Math.random()}`,
                    platform: "facebook" as const,
                    interaction_type: "dm" as const,
                    content: msg.message || "",
                    author_name: msg.from?.name || "Unknown",
                    author_handle: msg.from?.id || null,
                    created_at: msg.created_time,
                    status: "pending" as const,
                  });
                }
              }
            }
          }
        }

        console.log(`Total interactions to upsert: ${allInteractions.length}`);

        // Upsert interactions to avoid duplicates
        let inserted = 0;
        let errors = 0;
        for (const interaction of allInteractions) {
          const { error: upsertErr } = await supabase
            .from("interactions")
            .upsert(interaction, { onConflict: "external_id,user_id" });

          if (upsertErr) {
            errors++;
            console.error("Upsert error:", JSON.stringify(upsertErr));
          } else {
            inserted++;
          }
        }

        // Update last_synced_at
        for (const platform of platforms) {
          await supabase
            .from("connected_platforms")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", platform.id);
        }

        console.log(`Sync complete: ${inserted} synced, ${errors} errors, ${allInteractions.length} total`);

        return new Response(
          JSON.stringify({ success: true, synced: inserted, errors, total: allInteractions.length }),
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

        // Get the interaction
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

        // Get the platform connection (use Page token)
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
          // Reply to comment using Page token
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
          // Send DM reply via page messaging
          const replyRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(platformConn.platform_account_id!)}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipient: { id: interaction.author_handle },
                message: { text: message },
                access_token: platformConn.access_token,
              }),
            }
          );
          replyResult = await replyRes.json();
        }

        if (replyResult?.error) {
          console.error("Reply error:", JSON.stringify(replyResult.error));
          return new Response(
            JSON.stringify({ error: "Failed to post reply", details: replyResult.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update interaction status
        await supabase
          .from("interactions")
          .update({
            status: "responded",
            response: message,
            responded_at: new Date().toISOString(),
          })
          .eq("id", interaction_id);

        return new Response(
          JSON.stringify({ success: true, reply_id: replyResult?.id }),
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
