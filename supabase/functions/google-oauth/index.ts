import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "get_client_id": {
        if (!GOOGLE_CLIENT_ID) {
          return new Response(
            JSON.stringify({ error: "GOOGLE_CLIENT_ID not configured" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ client_id: GOOGLE_CLIENT_ID }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        // All other actions require both credentials
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
          return new Response(
            JSON.stringify({ error: "Google API credentials not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Supabase secrets." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;
    }

    // Re-switch for credential-required actions
    switch (action) {
      case "exchange_code": {
        const { code, redirect_uri } = body;
        if (!code || !redirect_uri) {
          return new Response(
            JSON.stringify({ error: "code and redirect_uri are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri,
            grant_type: "authorization_code",
          }),
        });
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
          console.error("Google token exchange error:", tokenData);
          return new Response(
            JSON.stringify({ error: "Failed to exchange code", details: tokenData.error_description }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;

        // Fetch Google Business Profile accounts
        const accountsRes = await fetch(
          "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const accountsData = await accountsRes.json();

        if (accountsData.error) {
          console.error("Google accounts fetch error:", accountsData.error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch Google Business accounts", details: accountsData.error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const accounts = accountsData.accounts || [];
        const locationsPerAccount: any[] = [];

        for (const account of accounts) {
          try {
            const locRes = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const locData = await locRes.json();
            const locs = locData.locations || [];
            for (const loc of locs) {
              locationsPerAccount.push({
                account_name: account.name,
                account_display_name: account.accountName || account.name,
                location_name: loc.name,
                location_title: loc.title || "Business Location",
                location_id: loc.name.split("/").pop(),
              });
            }
          } catch (err) {
            console.error(`Failed to fetch locations for account ${account.name}:`, err);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            locations: locationsPerAccount,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "connect_locations": {
        const { locations, access_token: accessToken, refresh_token: refreshToken } = body;
        if (!locations || !Array.isArray(locations) || locations.length === 0) {
          return new Response(
            JSON.stringify({ error: "locations array is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const connected = [];
        for (const loc of locations) {
          const { data, error } = await supabase
            .from("connected_platforms")
            .upsert(
              {
                user_id: user.id,
                platform: "google",
                platform_account_id: loc.location_id || loc.location_name,
                platform_account_name: loc.location_title || "Google Business",
                access_token: accessToken,
                is_active: true,
                last_synced_at: new Date().toISOString(),
                metadata: {
                  account_name: loc.account_name,
                  location_name: loc.location_name,
                  refresh_token: refreshToken,
                },
              },
              { onConflict: "user_id,platform,platform_account_id" }
            )
            .select()
            .single();

          if (error) {
            console.error("Error storing Google location:", error);
          } else {
            connected.push(data);
          }
        }

        return new Response(
          JSON.stringify({ success: true, connected }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_reviews": {
        // Get all connected Google Business locations for this user
        const { data: googlePlatforms } = await supabase
          .from("connected_platforms")
          .select("*")
          .eq("user_id", user.id)
          .eq("platform", "google")
          .eq("is_active", true);

        if (!googlePlatforms || googlePlatforms.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected Google Business locations found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let totalNew = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        const errorDetails: any[] = [];

        for (const platform of googlePlatforms) {
          const locationName = (platform.metadata as any)?.location_name || `locations/${platform.platform_account_id}`;
          let accessToken = platform.access_token;

          // Refresh token if needed
          const refreshToken = (platform.metadata as any)?.refresh_token;
          if (refreshToken) {
            try {
              const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  refresh_token: refreshToken,
                  client_id: GOOGLE_CLIENT_ID,
                  client_secret: GOOGLE_CLIENT_SECRET,
                  grant_type: "refresh_token",
                }),
              });
              const refreshData = await refreshRes.json();
              if (refreshData.access_token) {
                accessToken = refreshData.access_token;
                // Update stored token
                await supabase
                  .from("connected_platforms")
                  .update({ access_token: accessToken })
                  .eq("id", platform.id);
              }
            } catch (err) {
              console.error("Token refresh error:", err);
            }
          }

          // Fetch reviews from Google My Business API
          let nextPageToken: string | null = null;
          let pageCount = 0;

          do {
            pageCount++;
            const url = new URL(
              `https://mybusiness.googleapis.com/v4/${locationName}/reviews`
            );
            url.searchParams.set("pageSize", "50");
            if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

            try {
              const reviewsRes = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const reviewsData = await reviewsRes.json();

              if (reviewsData.error) {
                console.error("Google reviews fetch error:", reviewsData.error);
                errorDetails.push({
                  platform: "google",
                  location: platform.platform_account_name,
                  error: reviewsData.error.message,
                });
                totalErrors++;
                break;
              }

              for (const review of reviewsData.reviews || []) {
                const externalId = review.reviewId;

                // Check for existing
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

                const starRating = review.starRating;
                const ratingMap: Record<string, number> = {
                  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
                };
                const numericRating = ratingMap[starRating] || null;

                // Determine sentiment from star rating
                let sentiment: "positive" | "neutral" | "negative" = "neutral";
                if (numericRating !== null) {
                  if (numericRating >= 4) sentiment = "positive";
                  else if (numericRating <= 2) sentiment = "negative";
                }

                const reviewText = review.comment || "";
                const authorName = review.reviewer?.displayName || "Google Reviewer";
                const reviewUrl = `https://search.google.com/local/reviews?placeid=${platform.platform_account_id}`;

                const { error: insertErr } = await supabase
                  .from("interactions")
                  .insert({
                    user_id: user.id,
                    external_id: externalId,
                    platform: "google",
                    interaction_type: "review",
                    content: reviewText,
                    author_name: authorName,
                    author_handle: review.reviewer?.profilePhotoUrl || null,
                    post_url: reviewUrl,
                    created_at: review.createTime || new Date().toISOString(),
                    status: "pending",
                    sentiment,
                    metadata: {
                      star_rating: numericRating,
                      star_rating_text: starRating,
                      review_reply: review.reviewReply?.comment || null,
                      location_name: platform.platform_account_name,
                      review_id: externalId,
                    },
                  });

                if (insertErr) {
                  if (!insertErr.message?.includes("duplicate")) {
                    console.error("Insert review error:", insertErr);
                    totalErrors++;
                  } else {
                    totalSkipped++;
                  }
                } else {
                  totalNew++;
                }
              }

              nextPageToken = reviewsData.nextPageToken || null;
            } catch (err) {
              console.error("Reviews fetch error:", err);
              errorDetails.push({ platform: "google", error: String(err) });
              totalErrors++;
              break;
            }
          } while (nextPageToken && pageCount < 20);

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
          .eq("platform", "google")
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (!platform?.access_token) {
          return new Response(
            JSON.stringify({ error: "No active Google Business connection found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const locationName = (platform.metadata as any)?.location_name;
        const reviewId = (interaction.metadata as any)?.review_id || interaction.external_id;

        if (!locationName || !reviewId) {
          return new Response(
            JSON.stringify({ error: "Missing location or review ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Post reply via Google My Business API
        const replyRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${reviewId}/reply`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${platform.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment: message }),
          }
        );
        const replyData = await replyRes.json();

        if (replyData.error) {
          console.error("Google reply error:", replyData.error);
          return new Response(
            JSON.stringify({ error: "Failed to post reply", details: replyData.error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update interaction status
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
    console.error("google-oauth error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
