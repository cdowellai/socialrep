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

        // Step 2: Exchange for long-lived token
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

        // Step 3: Fetch user's Facebook Pages
        const pagesRes = await fetch(
          `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,picture{url},instagram_business_account&access_token=${encodeURIComponent(longLivedToken)}`
        );
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
          console.error("Pages fetch error:", pagesData.error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch pages", details: pagesData.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Store the user-level long-lived token temporarily
        // Return pages for selection
        const pages = (pagesData.data || []).map((page: any) => ({
          id: page.id,
          name: page.name,
          access_token: page.access_token,
          picture_url: page.picture?.data?.url || null,
          instagram_business_account: page.instagram_business_account?.id || null,
        }));

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
        const { pages, user_token } = body;
        if (!pages || !Array.isArray(pages) || pages.length === 0) {
          return new Response(
            JSON.stringify({ error: "pages array is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const connected = [];

        for (const page of pages) {
          // Store Facebook Page connection
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
          }

          // If page has Instagram business account, store that too
          if (page.instagram_business_account_id) {
            // Fetch Instagram account details
            const igRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(page.instagram_business_account_id)}?fields=id,name,username,profile_picture_url&access_token=${encodeURIComponent(page.access_token)}`
            );
            const igData = await igRes.json();

            if (!igData.error) {
              const { data: igConn, error: igErr } = await supabase
                .from("connected_platforms")
                .upsert(
                  {
                    user_id: user.id,
                    platform: "instagram",
                    platform_account_id: igData.id,
                    platform_account_name: igData.username || igData.name || `IG: ${page.name}`,
                    access_token: page.access_token, // Use page token for IG
                    is_active: true,
                    last_synced_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id,platform,platform_account_id" }
                )
                .select()
                .single();

              if (igErr) {
                console.error("Error storing IG account:", igErr);
              } else {
                connected.push({ platform: "instagram", ...igConn });
              }
            }
          }
        }

        return new Response(
          JSON.stringify({ success: true, connected }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_interactions": {
        // Fetch interactions from connected Facebook pages and Instagram accounts
        const { data: platforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .in("platform", ["facebook", "instagram"])
          .eq("is_active", true);

        if (!platforms || platforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Meta platforms found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const allInteractions = [];

        for (const platform of platforms) {
          if (!platform.access_token || !platform.platform_account_id) continue;

          if (platform.platform === "facebook") {
            // Fetch page posts and comments
            const postsRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(platform.platform_account_id)}/posts?fields=id,message,created_time,comments{id,message,from,created_time}&limit=25&access_token=${encodeURIComponent(platform.access_token)}`
            );
            const postsData = await postsRes.json();

            if (postsData.data) {
              for (const post of postsData.data) {
                if (post.comments?.data) {
                  for (const comment of post.comments.data) {
                    allInteractions.push({
                      user_id: user.id,
                      external_id: comment.id,
                      platform: "facebook",
                      interaction_type: "comment",
                      content: comment.message || "",
                      author_name: comment.from?.name || "Unknown",
                      author_handle: comment.from?.id || null,
                      post_url: `https://facebook.com/${post.id}`,
                      created_at: comment.created_time,
                    });
                  }
                }
              }
            }

            // Fetch page conversations (DMs)
            const convoRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(platform.platform_account_id)}/conversations?fields=participants,messages.limit(5){message,from,created_time}&limit=25&access_token=${encodeURIComponent(platform.access_token)}`
            );
            const convoData = await convoRes.json();

            if (convoData.data) {
              for (const convo of convoData.data) {
                if (convo.messages?.data) {
                  for (const msg of convo.messages.data) {
                    allInteractions.push({
                      user_id: user.id,
                      external_id: msg.id,
                      platform: "facebook",
                      interaction_type: "dm",
                      content: msg.message || "",
                      author_name: msg.from?.name || "Unknown",
                      author_handle: msg.from?.id || null,
                      created_at: msg.created_time,
                    });
                  }
                }
              }
            }
          }

          if (platform.platform === "instagram") {
            // Fetch IG media and comments
            const mediaRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(platform.platform_account_id)}/media?fields=id,caption,timestamp,comments{id,text,username,timestamp}&limit=25&access_token=${encodeURIComponent(platform.access_token)}`
            );
            const mediaData = await mediaRes.json();

            if (mediaData.data) {
              for (const media of mediaData.data) {
                if (media.comments?.data) {
                  for (const comment of media.comments.data) {
                    allInteractions.push({
                      user_id: user.id,
                      external_id: comment.id,
                      platform: "instagram",
                      interaction_type: "comment",
                      content: comment.text || "",
                      author_name: comment.username || "Unknown",
                      author_handle: comment.username || null,
                      post_url: `https://instagram.com/p/${media.id}`,
                      created_at: comment.timestamp,
                    });
                  }
                }
              }
            }
          }
        }

        // Upsert interactions to avoid duplicates
        let inserted = 0;
        for (const interaction of allInteractions) {
          const { error: upsertErr } = await supabase
            .from("interactions")
            .upsert(interaction, { onConflict: "external_id,user_id" });

          if (!upsertErr) inserted++;
        }

        // Update last_synced_at
        for (const platform of platforms) {
          await supabase
            .from("connected_platforms")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", platform.id);
        }

        return new Response(
          JSON.stringify({ success: true, synced: inserted, total: allInteractions.length }),
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

        // Get the platform connection
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
