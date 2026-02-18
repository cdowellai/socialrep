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

      // =========== DIAGNOSTICS ===========
      case "run_diagnostics": {
        const checks: any[] = [];

        // Get connected pages
        const { data: platforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "facebook")
          .eq("is_active", true);

        if (!platforms || platforms.length === 0) {
          return new Response(
            JSON.stringify({
              success: true,
              checks: [{ name: "Connected Pages", status: "fail", detail: "No connected Facebook pages found. Connect a page first." }],
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        for (const platform of platforms) {
          const pageId = platform.platform_account_id;
          const pageToken = platform.access_token;
          const pageName = platform.platform_account_name || pageId;

          // A) Token introspection
          try {
            const debugRes = await fetch(
              `${META_GRAPH_URL}/debug_token?input_token=${encodeURIComponent(pageToken!)}&access_token=${encodeURIComponent(META_APP_ID)}|${encodeURIComponent(META_APP_SECRET)}`
            );
            const debugData = await debugRes.json();
            const tokenInfo = debugData.data;

            if (tokenInfo?.error) {
              checks.push({
                name: `Token Validity (${pageName})`,
                status: "fail",
                detail: `Token error: ${tokenInfo.error.message}`,
                action: "reconnect",
              });
            } else if (!tokenInfo?.is_valid) {
              checks.push({
                name: `Token Validity (${pageName})`,
                status: "fail",
                detail: `Token is invalid or expired. Type: ${tokenInfo?.type || "unknown"}`,
                action: "reconnect",
              });
            } else {
              const expiresAt = tokenInfo.expires_at
                ? tokenInfo.expires_at === 0
                  ? "Never (permanent page token)"
                  : new Date(tokenInfo.expires_at * 1000).toISOString()
                : "Unknown";
              checks.push({
                name: `Token Validity (${pageName})`,
                status: "pass",
                detail: `Valid. Type: ${tokenInfo.type || "PAGE"}. Expires: ${expiresAt}. App ID: ${tokenInfo.app_id}`,
              });

              // Check scopes
              const grantedScopes: string[] = tokenInfo.scopes || [];
              const requiredScopes = [
                "pages_show_list",
                "pages_read_engagement",
                "pages_read_user_content",
              ];
              const optionalScopes = [
                { scope: "pages_manage_metadata", purpose: "webhook subscriptions" },
                { scope: "pages_manage_posts", purpose: "posting replies to comments" },
                { scope: "pages_manage_engagement", purpose: "managing comments" },
                { scope: "pages_messaging", purpose: "reading/sending Messenger messages" },
              ];

              const missingRequired = requiredScopes.filter((s) => !grantedScopes.includes(s));
              const missingOptional = optionalScopes.filter((s) => !grantedScopes.includes(s.scope));

              if (missingRequired.length > 0) {
                checks.push({
                  name: `Required Scopes (${pageName})`,
                  status: "fail",
                  detail: `Missing required scopes: ${missingRequired.join(", ")}. Reconnect and grant these permissions.`,
                  action: "reconnect",
                });
              } else {
                checks.push({
                  name: `Required Scopes (${pageName})`,
                  status: "pass",
                  detail: `All required scopes granted: ${requiredScopes.join(", ")}`,
                });
              }

              if (missingOptional.length > 0) {
                checks.push({
                  name: `Optional Scopes (${pageName})`,
                  status: "warn",
                  detail: `Missing: ${missingOptional.map((s) => `${s.scope} (${s.purpose})`).join("; ")}`,
                  action: "reconnect",
                });
              } else {
                checks.push({
                  name: `Optional Scopes (${pageName})`,
                  status: "pass",
                  detail: `All optional scopes granted.`,
                });
              }

              // Check app mode
              if (tokenInfo.app_id) {
                checks.push({
                  name: `App Mode (${pageName})`,
                  status: "info",
                  detail: `App ID: ${tokenInfo.app_id}. If app is in Development mode, only test users and page admins can interact. Switch to Live mode for production.`,
                });
              }
            }
          } catch (err) {
            checks.push({
              name: `Token Introspection (${pageName})`,
              status: "fail",
              detail: `Error checking token: ${String(err)}`,
            });
          }

          // B) Page access check via /me/accounts
          try {
            const meRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(pageId!)}?fields=id,name,access_token&access_token=${encodeURIComponent(pageToken!)}`
            );
            const meData = await meRes.json();

            if (meData.error) {
              checks.push({
                name: `Page Access (${pageName})`,
                status: "fail",
                detail: `API error: [${meData.error.code}/${meData.error.error_subcode || "N/A"}] ${meData.error.message}`,
                action: meData.error.code === 190 ? "reconnect" : "reselect_page",
              });
            } else {
              checks.push({
                name: `Page Access (${pageName})`,
                status: "pass",
                detail: `Page "${meData.name}" (${meData.id}) accessible.`,
              });
            }
          } catch (err) {
            checks.push({
              name: `Page Access (${pageName})`,
              status: "fail",
              detail: `Error: ${String(err)}`,
            });
          }

          // C) Feed read check
          try {
            const feedRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(pageId!)}/feed?fields=id&limit=1&access_token=${encodeURIComponent(pageToken!)}`
            );
            const feedData = await feedRes.json();

            if (feedData.error) {
              checks.push({
                name: `Feed Read (${pageName})`,
                status: "fail",
                detail: `Cannot read feed: [${feedData.error.code}] ${feedData.error.message}`,
              });
            } else {
              checks.push({
                name: `Feed Read (${pageName})`,
                status: "pass",
                detail: `Feed accessible. ${feedData.data?.length ?? 0} post(s) in sample.`,
              });
            }
          } catch (err) {
            checks.push({
              name: `Feed Read (${pageName})`,
              status: "fail",
              detail: `Error: ${String(err)}`,
            });
          }

          // D) Conversations read check
          try {
            const convoRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(pageId!)}/conversations?fields=id&limit=1&access_token=${encodeURIComponent(pageToken!)}`
            );
            const convoData = await convoRes.json();

            if (convoData.error) {
              checks.push({
                name: `Messenger Access (${pageName})`,
                status: "fail",
                detail: `Cannot read conversations: [${convoData.error.code}] ${convoData.error.message}. Grant pages_messaging permission.`,
                action: "reconnect",
              });
            } else {
              checks.push({
                name: `Messenger Access (${pageName})`,
                status: "pass",
                detail: `Conversations accessible. ${convoData.data?.length ?? 0} conversation(s) in sample.`,
              });
            }
          } catch (err) {
            checks.push({
              name: `Messenger Access (${pageName})`,
              status: "fail",
              detail: `Error: ${String(err)}`,
            });
          }
        }

        return new Response(
          JSON.stringify({ success: true, checks }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // =========== TEST CONNECTION ===========
      case "test_connection": {
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

          const meRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}?fields=id,name&access_token=${encodeURIComponent(pageToken)}`
          );
          const meData = await meRes.json();
          if (meData.error) {
            results.push({ page: platform.platform_account_name, error: meData.error.message, token_valid: false });
            continue;
          }

          const feedRes = await fetch(
            `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/feed?fields=id,message,from,created_time,comments.limit(25){id,message,from,created_time}&limit=25&access_token=${encodeURIComponent(pageToken)}`
          );
          const feedData = await feedRes.json();
          let postCount = 0, commentCount = 0;
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

      // =========== SYNC INTERACTIONS (with pagination + observability) ===========
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

        const runStarted = new Date().toISOString();
        console.log(`[sync] Starting sync for ${platforms.length} connected Facebook page(s)`);

        let totalComments = 0, totalMessages = 0;
        let newComments = 0, newMessages = 0;
        let skippedCount = 0, syncErrors = 0;
        const errorDetails: any[] = [];

        for (const platform of platforms) {
          if (!platform.access_token || !platform.platform_account_id) continue;

          const pageId = platform.platform_account_id;
          const pageToken = platform.access_token;

          // 1. Fetch posts + comments with pagination
          console.log(`[sync] Fetching feed for page ${pageId}...`);
          let feedUrl: string | null = `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/feed?fields=id,message,from,created_time,comments.limit(100){id,message,from,created_time,parent}&limit=25&access_token=${encodeURIComponent(pageToken)}`;
          let feedPages = 0;

          while (feedUrl && feedPages < 10) {
            feedPages++;
            try {
              const feedRes = await fetch(feedUrl);
              const feedData = await feedRes.json();

              if (feedData.error) {
                console.error(`[sync] Feed error for page ${pageId}:`, JSON.stringify(feedData.error));
                errorDetails.push({ endpoint: "feed", code: feedData.error.code, message: feedData.error.message });
                syncErrors++;
                break;
              }

              for (const post of feedData.data || []) {
                if (!post.comments?.data) continue;
                for (const comment of post.comments.data) {
                  totalComments++;
                  const { data: existing } = await supabase
                    .from("interactions")
                    .select("id")
                    .eq("external_id", comment.id)
                    .eq("user_id", user.id)
                    .maybeSingle();

                  if (existing) { skippedCount++; continue; }

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
                    if (!insertErr.message?.includes("duplicate")) {
                      console.error("[sync] Insert comment error:", JSON.stringify(insertErr));
                      errorDetails.push({ endpoint: "insert_comment", message: insertErr.message });
                      syncErrors++;
                    } else {
                      skippedCount++;
                    }
                  } else {
                    newComments++;
                  }
                }
              }

              // Pagination
              feedUrl = feedData.paging?.next || null;
            } catch (err) {
              console.error(`[sync] Feed fetch error:`, err);
              errorDetails.push({ endpoint: "feed_fetch", message: String(err) });
              syncErrors++;
              break;
            }
          }

          // 2. Fetch conversations (DMs) with pagination
          console.log(`[sync] Fetching conversations for page ${pageId}...`);
          let convoUrl: string | null = `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/conversations?fields=id,participants,updated_time&limit=25&access_token=${encodeURIComponent(pageToken)}`;
          let convoPages = 0;

          while (convoUrl && convoPages < 10) {
            convoPages++;
            try {
              const convoRes = await fetch(convoUrl);
              const convoData = await convoRes.json();

              if (convoData.error) {
                console.error(`[sync] Conversations error for page ${pageId}:`, JSON.stringify(convoData.error));
                errorDetails.push({ endpoint: "conversations", code: convoData.error.code, message: convoData.error.message });
                break; // DM permission may not be granted
              }

              for (const convo of convoData.data || []) {
                // Fetch messages for this conversation
                let msgsUrl: string | null = `${META_GRAPH_URL}/${encodeURIComponent(convo.id)}/messages?fields=id,message,from,created_time&limit=25&access_token=${encodeURIComponent(pageToken)}`;

                while (msgsUrl) {
                  const msgsRes = await fetch(msgsUrl);
                  const msgsData = await msgsRes.json();

                  if (msgsData.error) {
                    errorDetails.push({ endpoint: "conversation_messages", conversation_id: convo.id, code: msgsData.error.code, message: msgsData.error.message });
                    break;
                  }

                  for (const msg of msgsData.data || []) {
                    totalMessages++;
                    const msgExternalId = msg.id || `dm_${convo.id}_${msg.created_time}`;

                    const { data: existing } = await supabase
                      .from("interactions")
                      .select("id")
                      .eq("external_id", msgExternalId)
                      .eq("user_id", user.id)
                      .maybeSingle();

                    if (existing) { skippedCount++; continue; }

                    // Find participant who is not the page
                    const senderPsid = msg.from?.id || null;

                    const { error: insertErr } = await supabase
                      .from("interactions")
                      .insert({
                        user_id: user.id,
                        external_id: msgExternalId,
                        platform: "facebook",
                        interaction_type: "dm",
                        content: msg.message || "",
                        author_name: msg.from?.name || "Unknown",
                        author_handle: senderPsid,
                        created_at: msg.created_time,
                        status: "pending",
                        metadata: { conversation_id: convo.id, sender_psid: senderPsid },
                      });

                    if (insertErr) {
                      if (!insertErr.message?.includes("duplicate")) {
                        console.error("[sync] Insert DM error:", JSON.stringify(insertErr));
                        errorDetails.push({ endpoint: "insert_dm", message: insertErr.message });
                        syncErrors++;
                      } else {
                        skippedCount++;
                      }
                    } else {
                      newMessages++;
                    }
                  }

                  msgsUrl = msgsData.paging?.next || null;
                }
              }

              convoUrl = convoData.paging?.next || null;
            } catch (err) {
              console.error(`[sync] Conversation fetch error:`, err);
              errorDetails.push({ endpoint: "conversation_fetch", message: String(err) });
              break;
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
          skipped: skippedCount,
          errors: syncErrors,
          error_details: errorDetails,
          synced_at: new Date().toISOString(),
        };

        // Log run to integration_run_logs
        try {
          await supabase.from("integration_run_logs").insert({
            user_id: user.id,
            platform: "facebook",
            run_type: "sync",
            started_at: runStarted,
            finished_at: new Date().toISOString(),
            status: syncErrors > 0 ? (newComments + newMessages > 0 ? "partial" : "failed") : "success",
            fetched_count: totalComments + totalMessages,
            inserted_count: newComments + newMessages,
            skipped_count: skippedCount,
            error_count: syncErrors,
            errors: errorDetails,
            metadata: { pages_synced: platforms.length },
          });
        } catch (logErr) {
          console.error("[sync] Failed to write run log:", logErr);
        }

        console.log(`[sync] Complete:`, JSON.stringify(summary));

        return new Response(
          JSON.stringify(summary),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // =========== POST REPLY ===========
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

        let replyResult: any;

        if (interaction.interaction_type === "comment") {
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
          // Use POST /me/messages with recipient PSID
          const recipientPsid = (interaction.metadata as any)?.sender_psid || interaction.author_handle;
          console.log(`[reply] Sending Messenger reply to PSID ${recipientPsid}`);
          const replyRes = await fetch(
            `${META_GRAPH_URL}/me/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipient: { id: recipientPsid },
                message: { text: message },
                access_token: platformConn.access_token,
              }),
            }
          );
          replyResult = await replyRes.json();
        }

        if (replyResult?.error) {
          console.error("[reply] Error:", JSON.stringify(replyResult.error));

          // Log failed reply
          try {
            await supabase.from("integration_run_logs").insert({
              user_id: user.id,
              platform: "facebook",
              run_type: "reply",
              started_at: new Date().toISOString(),
              finished_at: new Date().toISOString(),
              status: "failed",
              error_count: 1,
              errors: [{ interaction_id, code: replyResult.error.code, message: replyResult.error.message }],
            });
          } catch (_) {}

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

        const replyExternalId = replyResult?.id || replyResult?.message_id;
        console.log(`[reply] Success, FB reply ID: ${replyExternalId}`);

        // Log successful reply
        try {
          await supabase.from("integration_run_logs").insert({
            user_id: user.id,
            platform: "facebook",
            run_type: "reply",
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
            status: "success",
            inserted_count: 1,
            metadata: { interaction_id, reply_external_id: replyExternalId },
          });
        } catch (_) {}

        return new Response(
          JSON.stringify({ success: true, reply_id: replyExternalId }),
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
            results.push({ page: platform.platform_account_name, success: false, error: String(err) });
          }
        }

        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // =========== HEALTH REPORT (structured JSON) ===========
      case "health_report": {
        const { data: fbPlatforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "facebook")
          .eq("is_active", true);

        if (!fbPlatforms || fbPlatforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Facebook pages" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const reports: any[] = [];
        for (const p of fbPlatforms) {
          const pageToken = p.access_token!;
          const pageId = p.platform_account_id!;
          const report: any = {
            page_name: p.platform_account_name,
            selected_page_id: pageId,
            app_mode: "unknown",
            granted_scopes: [],
            missing_scopes: [],
            token_valid: false,
            token_expires_at: null,
            webhook_status: "unknown",
            last_sync_result: null,
          };

          // Token introspection
          try {
            const dbgRes = await fetch(
              `${META_GRAPH_URL}/debug_token?input_token=${encodeURIComponent(pageToken)}&access_token=${encodeURIComponent(META_APP_ID!)}|${encodeURIComponent(META_APP_SECRET!)}`
            );
            const dbg = await dbgRes.json();
            const d = dbg.data || {};
            report.token_valid = !!d.is_valid;
            report.token_expires_at = d.expires_at === 0 ? "never" : d.expires_at ? new Date(d.expires_at * 1000).toISOString() : null;
            report.granted_scopes = d.scopes || [];
            report.app_mode = d.application ? "check_dashboard" : "unknown";

            const allDesired = [
              "pages_show_list", "pages_read_engagement", "pages_read_user_content",
              "pages_manage_metadata", "pages_manage_posts", "pages_manage_engagement", "pages_messaging",
            ];
            report.missing_scopes = allDesired.filter((s: string) => !report.granted_scopes.includes(s));
          } catch (e) {
            report.token_valid = false;
            report.token_expires_at = `error: ${String(e)}`;
          }

          // Webhook status
          try {
            const subRes = await fetch(
              `${META_GRAPH_URL}/${encodeURIComponent(pageId)}/subscribed_apps?access_token=${encodeURIComponent(pageToken)}`
            );
            const subData = await subRes.json();
            if (subData.error) {
              report.webhook_status = `error: ${subData.error.message}`;
            } else if (subData.data && subData.data.length > 0) {
              const fields = subData.data.flatMap((a: any) => a.subscribed_fields || []);
              report.webhook_status = `subscribed (${fields.join(", ")})`;
            } else {
              report.webhook_status = "not_subscribed";
            }
          } catch (e) {
            report.webhook_status = `error: ${String(e)}`;
          }

          // Last sync result
          const { data: lastLog } = await supabase
            .from("integration_run_logs")
            .select("*")
            .eq("user_id", user.id)
            .eq("platform", "facebook")
            .order("created_at", { ascending: false })
            .limit(1);

          if (lastLog && lastLog.length > 0) {
            const l = lastLog[0];
            report.last_sync_result = {
              status: l.status,
              started_at: l.started_at,
              finished_at: l.finished_at,
              fetched: l.fetched_count,
              inserted: l.inserted_count,
              errors: l.error_count,
              token_status: l.token_status,
            };
          }

          reports.push(report);
        }

        return new Response(
          JSON.stringify({ success: true, health_reports: reports }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // =========== GET SYNC LOGS ===========
      case "get_sync_logs": {
        const { data: logs } = await supabase
          .from("integration_run_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "facebook")
          .order("created_at", { ascending: false })
          .limit(20);

        return new Response(
          JSON.stringify({ success: true, logs: logs || [] }),
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
