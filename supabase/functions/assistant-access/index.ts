import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

function generateToken(length = 64): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}

function generateTempPassword(): string {
  return "Tmp!" + generateToken(16);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Verify caller is authenticated
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return errorResponse("Unauthorized", 401);

  // Create user-context client to verify identity
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return errorResponse("Unauthorized", 401);

  // Create admin client for privileged operations
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Get user's team
  const { data: profile } = await adminClient
    .from("profiles")
    .select("current_team_id")
    .eq("user_id", user.id)
    .single();

  const teamId = profile?.current_team_id;
  if (!teamId) return errorResponse("No team found", 400);

  // Verify caller is admin/owner
  const { data: isAdmin } = await adminClient.rpc("is_team_admin", {
    _user_id: user.id,
    _team_id: teamId,
  });
  if (!isAdmin) return errorResponse("Admin access required", 403);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // pathParts: ["assistant-access"] or ["assistant-access", id, action]
  const accessId = pathParts.length >= 2 ? pathParts[1] : null;
  const subAction = pathParts.length >= 3 ? pathParts[2] : null;

  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

  try {
    // Route: GET /assistant-access — list all
    if (req.method === "GET" && !accessId) {
      // Expire stale records first
      await adminClient.rpc("check_assistant_access_expiry");

      const { data, error } = await adminClient
        .from("assistant_access")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return jsonResponse({ records: data });
    }

    // Route: POST /assistant-access — create new
    if (req.method === "POST" && !accessId) {
      const body = await req.json();
      const { email, role, expiration, use_password } = body;

      if (!email || !role) return errorResponse("Email and role are required");
      if (!["viewer", "operator", "admin"].includes(role))
        return errorResponse("Invalid role");

      // Calculate expiration
      let expiresAt: Date;
      if (expiration === "24h") expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      else if (expiration === "72h") expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      else if (expiration === "7d") expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      else if (body.custom_expiration) expiresAt = new Date(body.custom_expiration);
      else expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      if (expiresAt <= new Date()) return errorResponse("Expiration must be in the future");

      const magicToken = generateToken();
      const magicLinkExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

      let tempPassword: string | null = null;
      let authUserId: string | null = null;

      // Create or find the auth user
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === email);

      if (existingUser) {
        authUserId = existingUser.id;
      } else {
        // Create a new user
        tempPassword = use_password ? generateTempPassword() : generateToken(20);
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { is_assistant_access: true, team_id: teamId },
        });
        if (createError) throw createError;
        authUserId = newUser.user.id;
      }

      // Add user to team as member with the specified role mapping
      const teamRole = role === "admin" ? "admin" : role === "operator" ? "member" : "viewer";
      const { data: existingMember } = await adminClient
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", authUserId)
        .maybeSingle();

      if (!existingMember) {
        await adminClient.from("team_members").insert({
          team_id: teamId,
          user_id: authUserId,
          role: teamRole,
          invited_by: user.id,
          accepted_at: new Date().toISOString(),
        });
      }

      // Create access record
      const { data: accessRecord, error: insertError } = await adminClient
        .from("assistant_access")
        .insert({
          email,
          role,
          team_id: teamId,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          status: "pending",
          auth_user_id: authUserId,
          magic_link_token: magicToken,
          magic_link_expires_at: magicLinkExpiresAt.toISOString(),
          force_password_reset: use_password ? true : false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate magic link
      const { data: magicLinkData, error: magicError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${req.headers.get("origin") || supabaseUrl}/dashboard`,
        },
      });

      let loginLink = null;
      if (!magicError && magicLinkData?.properties?.action_link) {
        loginLink = magicLinkData.properties.action_link;
      }

      // Audit log
      await adminClient.from("assistant_access_audit_logs").insert({
        access_id: accessRecord.id,
        event_type: "access_created",
        actor_id: user.id,
        target_email: email,
        team_id: teamId,
        ip_address: clientIp,
        metadata: { role, expires_at: expiresAt.toISOString(), use_password: !!use_password },
      });

      return jsonResponse({
        access: accessRecord,
        login_link: loginLink,
        temp_password: use_password ? tempPassword : null,
        message: "Temporary access created successfully",
      });
    }

    // Route: POST /assistant-access/:id/revoke
    if (req.method === "POST" && accessId && subAction === "revoke") {
      const { data: access } = await adminClient
        .from("assistant_access")
        .select("*")
        .eq("id", accessId)
        .eq("team_id", teamId)
        .single();

      if (!access) return errorResponse("Access record not found", 404);

      // Update status
      await adminClient
        .from("assistant_access")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: user.id,
        })
        .eq("id", accessId);

      // Remove from team
      if (access.auth_user_id) {
        await adminClient
          .from("team_members")
          .delete()
          .eq("team_id", teamId)
          .eq("user_id", access.auth_user_id);
      }

      // Audit log
      await adminClient.from("assistant_access_audit_logs").insert({
        access_id: accessId,
        event_type: "access_revoked",
        actor_id: user.id,
        target_email: access.email,
        team_id: teamId,
        ip_address: clientIp,
      });

      return jsonResponse({ message: "Access revoked" });
    }

    // Route: POST /assistant-access/:id/extend
    if (req.method === "POST" && accessId && subAction === "extend") {
      const body = await req.json();
      const { expiration } = body;

      let newExpiry: Date;
      if (expiration === "24h") newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      else if (expiration === "72h") newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);
      else if (expiration === "7d") newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      else if (body.custom_expiration) newExpiry = new Date(body.custom_expiration);
      else newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const { data: access } = await adminClient
        .from("assistant_access")
        .select("*")
        .eq("id", accessId)
        .eq("team_id", teamId)
        .single();

      if (!access) return errorResponse("Access record not found", 404);

      await adminClient
        .from("assistant_access")
        .update({
          expires_at: newExpiry.toISOString(),
          status: "active",
        })
        .eq("id", accessId);

      // Re-add to team if was expired
      if (access.auth_user_id && access.status === "expired") {
        const teamRole = access.role === "admin" ? "admin" : access.role === "operator" ? "member" : "viewer";
        const { data: existingMember } = await adminClient
          .from("team_members")
          .select("id")
          .eq("team_id", teamId)
          .eq("user_id", access.auth_user_id)
          .maybeSingle();

        if (!existingMember) {
          await adminClient.from("team_members").insert({
            team_id: teamId,
            user_id: access.auth_user_id,
            role: teamRole,
            invited_by: user.id,
            accepted_at: new Date().toISOString(),
          });
        }
      }

      await adminClient.from("assistant_access_audit_logs").insert({
        access_id: accessId,
        event_type: "access_extended",
        actor_id: user.id,
        target_email: access.email,
        team_id: teamId,
        ip_address: clientIp,
        metadata: { new_expires_at: newExpiry.toISOString() },
      });

      return jsonResponse({ message: "Access extended", new_expires_at: newExpiry.toISOString() });
    }

    // Route: POST /assistant-access/:id/resend
    if (req.method === "POST" && accessId && subAction === "resend") {
      const { data: access } = await adminClient
        .from("assistant_access")
        .select("*")
        .eq("id", accessId)
        .eq("team_id", teamId)
        .single();

      if (!access) return errorResponse("Access record not found", 404);
      if (access.status === "revoked") return errorResponse("Cannot resend for revoked access");

      const { data: magicLinkData, error: magicError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: access.email,
        options: {
          redirectTo: `${req.headers.get("origin") || supabaseUrl}/dashboard`,
        },
      });

      let loginLink = null;
      if (!magicError && magicLinkData?.properties?.action_link) {
        loginLink = magicLinkData.properties.action_link;
      }

      await adminClient.from("assistant_access_audit_logs").insert({
        access_id: accessId,
        event_type: "link_resent",
        actor_id: user.id,
        target_email: access.email,
        team_id: teamId,
        ip_address: clientIp,
      });

      return jsonResponse({ login_link: loginLink, message: "Link regenerated" });
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    console.error("Assistant access error:", err);
    return errorResponse(err.message || "Internal error", 500);
  }
});
