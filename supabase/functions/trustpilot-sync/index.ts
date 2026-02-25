import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRUSTPILOT_API_BASE = "https://api.trustpilot.com/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TRUSTPILOT_API_KEY = Deno.env.get("TRUSTPILOT_API_KEY");
    const TRUSTPILOT_API_SECRET = Deno.env.get("TRUSTPILOT_API_SECRET");

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "connect": {
        // Connect a Trustpilot business unit by domain or business unit ID
        const { business_unit_id, business_name, api_key, api_secret } = body;

        // Use provided credentials or fall back to env vars
        const effectiveApiKey = api_key || TRUSTPILOT_API_KEY;
        const effectiveApiSecret = api_secret || TRUSTPILOT_API_SECRET;

        if (!business_unit_id && !business_name) {
          return new Response(
            JSON.stringify({ error: "business_unit_id or business_name is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let resolvedBusinessUnitId = business_unit_id;
        let resolvedBusinessName = business_name;

        // If we have an API key, verify the business unit exists
        if (effectiveApiKey && business_unit_id) {
          try {
            const buRes = await fetch(
              `${TRUSTPILOT_API_BASE}/business-units/${encodeURIComponent(business_unit_id)}`,
              {
                headers: {
                  "apikey": effectiveApiKey,
                  "Content-Type": "application/json",
                },
              }
            );
            const buData = await buRes.json();
            if (buData.id) {
              resolvedBusinessUnitId = buData.id;
              resolvedBusinessName = buData.displayName || business_name || "Trustpilot Business";
            }
          } catch (err) {
            console.error("Trustpilot business unit lookup error:", err);
          }
        }

        // Store the connection
        const { data, error } = await supabase
          .from("connected_platforms")
          .upsert(
            {
              user_id: user.id,
              platform: "trustpilot",
              platform_account_id: resolvedBusinessUnitId || business_unit_id || "manual",
              platform_account_name: resolvedBusinessName || "Trustpilot Account",
              access_token: effectiveApiKey || null,
              is_active: true,
              last_synced_at: new Date().toISOString(),
              metadata: {
                api_key: effectiveApiKey || null,
                api_secret: effectiveApiSecret || null,
                business_unit_id: resolvedBusinessUnitId || business_unit_id,
              },
            },
            { onConflict: "user_id,platform,platform_account_id" }
          )
          .select()
          .single();

        if (error) {
          console.error("Error storing Trustpilot connection:", error);
          return new Response(
            JSON.stringify({ error: "Failed to store connection", details: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, connection: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_reviews": {
        const { data: tpPlatforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "trustpilot")
          .eq("is_active", true);

        if (!tpPlatforms || tpPlatforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Trustpilot accounts found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let totalNew = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const errorDetails: any[] = [];

        for (const platform of tpPlatforms) {
          const businessUnitId = (platform.metadata as any)?.business_unit_id || platform.platform_account_id;
          const apiKey = (platform.metadata as any)?.api_key || platform.access_token || TRUSTPILOT_API_KEY;

          if (!businessUnitId || businessUnitId === "manual") {
            // No API key / business unit — skip with error
            errorDetails.push({
              platform: "trustpilot",
              account: platform.platform_account_name,
              error: "No business unit ID configured. Please reconnect with your Trustpilot Business Unit ID.",
            });
            totalErrors++;
            continue;
          }

          if (!apiKey) {
            errorDetails.push({
              platform: "trustpilot",
              account: platform.platform_account_name,
              error: "No API key configured. Please add TRUSTPILOT_API_KEY to Supabase secrets.",
            });
            totalErrors++;
            continue;
          }

          let page = 1;
          const pageSize = 100;
          let hasMore = true;

          while (hasMore && page <= 20) {
            try {
              const reviewsRes = await fetch(
                `${TRUSTPILOT_API_BASE}/business-units/${encodeURIComponent(businessUnitId)}/reviews?perPage=${pageSize}&page=${page}&orderBy=createdat.desc`,
                {
                  headers: {
                    "apikey": apiKey,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!reviewsRes.ok) {
                const errText = await reviewsRes.text();
                console.error("Trustpilot reviews error:", reviewsRes.status, errText);
                errorDetails.push({
                  platform: "trustpilot",
                  account: platform.platform_account_name,
                  error: `HTTP ${reviewsRes.status}: ${errText.slice(0, 200)}`,
                });
                totalErrors++;
                break;
              }

              const reviewsData = await reviewsRes.json();
              const reviews = reviewsData.reviews || [];

              if (reviews.length === 0) {
                hasMore = false;
                break;
              }

              for (const review of reviews) {
                const externalId = review.id;

                const { data: existing } = await supabase
                  .from("interactions")
                  .select("id")
                  .eq("external_id", externalId)
                  .eq("user_id", user.id)
                  .maybeSingle();

                if (existing) {
                  totalSkipped++;
                  continue;
                }

                const stars = review.stars || 0;
                let sentiment: "positive" | "neutral" | "negative" = "neutral";
                if (stars >= 4) sentiment = "positive";
                else if (stars <= 2) sentiment = "negative";

                const reviewText = review.text || review.title || "";
                const authorName = review.consumer?.displayName || "Trustpilot Reviewer";
                const reviewUrl = `https://www.trustpilot.com/reviews/${review.id}`;

                const { error: insertErr } = await supabase
                  .from("interactions")
                  .insert({
                    user_id: user.id,
                    external_id: externalId,
                    platform: "trustpilot",
                    interaction_type: "review",
                    content: reviewText,
                    author_name: authorName,
                    author_handle: review.consumer?.id || null,
                    post_url: reviewUrl,
                    created_at: review.createdAt || new Date().toISOString(),
                    status: "pending",
                    sentiment,
                    metadata: {
                      star_rating: stars,
                      review_title: review.title || null,
                      is_verified: review.isVerified || false,
                      business_unit_id: businessUnitId,
                      review_id: externalId,
                      reply_text: review.companyReply?.text || null,
                    },
                  });

                if (insertErr) {
                  if (!insertErr.message?.includes("duplicate")) {
                    console.error("Insert Trustpilot review error:", insertErr);
                    totalErrors++;
                  } else {
                    totalSkipped++;
                  }
                } else {
                  totalNew++;
                }
              }

              // Check if there are more pages
              const totalReviews = reviewsData.total || 0;
              hasMore = page * pageSize < totalReviews;
              page++;
            } catch (err) {
              console.error("Trustpilot sync error:", err);
              errorDetails.push({ platform: "trustpilot", error: String(err) });
              totalErrors++;
              break;
            }
          }

          // Update last synced
          await supabase
            .from("connected_platforms")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", platform.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            new_reviews: totalNew,
            skipped: totalSkipped,
            errors: totalErrors,
            error_details: errorDetails,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reply_to_review": {
        const { interaction_id, message } = body;
        if (!interaction_id || !message) {
          return new Response(
            JSON.stringify({ error: "interaction_id and message are required" }),
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

        const { data: platform } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "trustpilot")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        const apiKey = (platform?.metadata as any)?.api_key || platform?.access_token || TRUSTPILOT_API_KEY;
        const apiSecret = (platform?.metadata as any)?.api_secret || TRUSTPILOT_API_SECRET;
        const businessUnitId = (platform?.metadata as any)?.business_unit_id || platform?.platform_account_id;
        const reviewId = (interaction.metadata as any)?.review_id || interaction.external_id;

        if (!apiKey || !apiSecret || !businessUnitId || !reviewId) {
          // Save reply locally even if we can't post to Trustpilot
          await supabase
            .from("interactions")
            .update({
              status: "responded",
              response: message,
              responded_at: new Date().toISOString(),
            })
            .eq("id", interaction_id);

          return new Response(
            JSON.stringify({
              success: false,
              notConnected: true,
              message: "Reply saved locally. Trustpilot API credentials not configured for posting replies.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get OAuth token for Trustpilot Business API (required for posting replies)
        const oauthRes = await fetch("https://api.trustpilot.com/v1/oauth/oauth-business-users-for-applications/accesstoken", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: "password",
            username: (platform?.metadata as any)?.username || "",
            password: (platform?.metadata as any)?.password || "",
          }),
        });
        const oauthData = await oauthRes.json();

        if (!oauthData.access_token) {
          // Save locally and return partial success
          await supabase
            .from("interactions")
            .update({
              status: "responded",
              response: message,
              responded_at: new Date().toISOString(),
            })
            .eq("id", interaction_id);

          return new Response(
            JSON.stringify({
              success: false,
              notConnected: true,
              message: "Reply saved locally. Trustpilot OAuth failed — business credentials needed.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Post reply
        const replyRes = await fetch(
          `${TRUSTPILOT_API_BASE}/private/business-units/${encodeURIComponent(businessUnitId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${oauthData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          }
        );

        if (!replyRes.ok) {
          const errText = await replyRes.text();
          console.error("Trustpilot reply error:", replyRes.status, errText);
        }

        // Always save locally
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

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err: any) {
    console.error("trustpilot-sync error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
