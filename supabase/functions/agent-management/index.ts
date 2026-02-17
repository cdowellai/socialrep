import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

// Simple XOR-based obfuscation with SUPABASE_SERVICE_ROLE_KEY as key
// In production, use Supabase Vault or KMS
function encryptSecret(plaintext: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  let result = "";
  for (let i = 0; i < plaintext.length; i++) {
    result += String.fromCharCode(
      plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result);
}

function decryptSecret(encoded: string): string {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback";
  const decoded = atob(encoded);
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}

async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;

  return { userId: data.claims.sub as string, supabase };
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function getUserTeamId(userId: string): Promise<string | null> {
  const svc = getServiceClient();
  const { data } = await svc.rpc("get_user_team_id", { _user_id: userId });
  return data || null;
}

async function isAdmin(userId: string, teamId: string): Promise<boolean> {
  const svc = getServiceClient();
  const { data } = await svc.rpc("is_team_admin", {
    _user_id: userId,
    _team_id: teamId,
  });
  return !!data;
}

async function auditLog(
  teamId: string,
  eventType: string,
  actorId: string,
  targetId: string | null,
  targetType: string | null,
  metadata: Record<string, unknown> = {},
  req?: Request
) {
  const svc = getServiceClient();
  await svc.from("agent_audit_logs").insert({
    workspace_id: teamId,
    event_type: eventType,
    actor_id: actorId,
    target_entity_id: targetId,
    target_entity_type: targetType,
    metadata,
    ip_address: req?.headers.get("x-forwarded-for") || req?.headers.get("cf-connecting-ip") || null,
    user_agent: req?.headers.get("user-agent") || null,
  });
}

// ─── Handlers ───

async function handleProviders(req: Request, method: string, pathParts: string[]) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();

  // GET /providers
  if (method === "GET" && pathParts.length === 0) {
    const { data, error: dbErr } = await svc
      .from("agent_providers")
      .select("*")
      .eq("workspace_id", teamId)
      .order("created_at", { ascending: false });

    if (dbErr) return err(dbErr.message, 500);

    // Mask API keys
    const masked = (data || []).map((p: any) => ({
      ...p,
      encrypted_api_key: p.encrypted_api_key ? maskKey("encrypted") : null,
      has_api_key: !!p.encrypted_api_key,
    }));

    return json(masked);
  }

  // POST /providers
  if (method === "POST" && pathParts.length === 0) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);

    const body = await req.json();
    const { name, provider_type, base_url, api_key, org_id, default_model, timeout_ms, max_retries, rate_limit_per_minute } = body;

    if (!name || !provider_type) return err("name and provider_type required");

    const encrypted = api_key ? encryptSecret(api_key) : null;

    const { data, error: dbErr } = await svc
      .from("agent_providers")
      .insert({
        workspace_id: teamId,
        name,
        provider_type,
        base_url: base_url || null,
        encrypted_api_key: encrypted,
        org_id: org_id || null,
        default_model: default_model || null,
        timeout_ms: timeout_ms || 30000,
        max_retries: max_retries || 3,
        rate_limit_per_minute: rate_limit_per_minute || 60,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (dbErr) return err(dbErr.message, 500);

    await auditLog(teamId, "provider_created", auth.userId, data.id, "agent_provider", { name, provider_type }, req);

    return json({ ...data, encrypted_api_key: undefined, has_api_key: !!encrypted });
  }

  // PATCH /providers/:id
  if (method === "PATCH" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);

    const id = pathParts[0];
    const body = await req.json();

    // Don't allow changing workspace_id
    delete body.workspace_id;
    delete body.id;

    if (body.api_key) {
      body.encrypted_api_key = encryptSecret(body.api_key);
      delete body.api_key;
      await auditLog(teamId, "secret_rotated", auth.userId, id, "agent_provider", {}, req);
    }

    const { data, error: dbErr } = await svc
      .from("agent_providers")
      .update(body)
      .eq("id", id)
      .eq("workspace_id", teamId)
      .select()
      .single();

    if (dbErr) return err(dbErr.message, 500);

    await auditLog(teamId, "provider_updated", auth.userId, id, "agent_provider", { fields: Object.keys(body) }, req);

    return json({ ...data, encrypted_api_key: undefined, has_api_key: !!data.encrypted_api_key });
  }

  // DELETE /providers/:id
  if (method === "DELETE" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);

    const id = pathParts[0];
    const { error: dbErr } = await svc
      .from("agent_providers")
      .delete()
      .eq("id", id)
      .eq("workspace_id", teamId);

    if (dbErr) return err(dbErr.message, 500);

    await auditLog(teamId, "provider_deleted", auth.userId, id, "agent_provider", {}, req);
    return json({ success: true });
  }

  // POST /providers/:id/test
  if (method === "POST" && pathParts.length === 2 && pathParts[1] === "test") {
    const id = pathParts[0];

    const { data: provider } = await svc
      .from("agent_providers")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", teamId)
      .single();

    if (!provider) return err("Provider not found", 404);
    if (!provider.encrypted_api_key) return err("No API key configured");

    const apiKey = decryptSecret(provider.encrypted_api_key);
    const baseUrl = provider.base_url || "https://api.openai.com/v1";

    const start = Date.now();
    try {
      const resp = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(provider.org_id ? { "OpenAI-Organization": provider.org_id } : {}),
        },
        signal: AbortSignal.timeout(provider.timeout_ms || 30000),
      });

      const latency = Date.now() - start;

      if (!resp.ok) {
        const text = await resp.text();
        await auditLog(teamId, "connection_tested", auth.userId, id, "agent_provider", { success: false, status: resp.status }, req);
        return json({ success: false, latency, status: resp.status, error: text.substring(0, 200) });
      }

      const models = await resp.json();
      const modelCount = models?.data?.length || 0;

      await auditLog(teamId, "connection_tested", auth.userId, id, "agent_provider", { success: true, latency, modelCount }, req);

      return json({ success: true, latency, models_available: modelCount });
    } catch (e) {
      const latency = Date.now() - start;
      await auditLog(teamId, "connection_tested", auth.userId, id, "agent_provider", { success: false, error: String(e) }, req);
      return json({ success: false, latency, error: e instanceof Error ? e.message : "Connection failed" });
    }
  }

  return err("Not found", 404);
}

async function handleModels(req: Request, method: string, pathParts: string[]) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();

  if (method === "GET") {
    const providerId = new URL(req.url).searchParams.get("provider_id");
    let query = svc.from("agent_models").select("*, agent_providers!inner(workspace_id)");
    if (providerId) query = query.eq("provider_id", providerId);
    query = query.eq("agent_providers.workspace_id", teamId);

    const { data, error: dbErr } = await query;
    if (dbErr) return err(dbErr.message, 500);
    return json(data || []);
  }

  if (method === "POST") {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    const { data, error: dbErr } = await svc.from("agent_models").insert(body).select().single();
    if (dbErr) return err(dbErr.message, 500);
    return json(data);
  }

  if (method === "PATCH" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    delete body.id;
    const { data, error: dbErr } = await svc.from("agent_models").update(body).eq("id", pathParts[0]).select().single();
    if (dbErr) return err(dbErr.message, 500);
    return json(data);
  }

  if (method === "DELETE" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const { error: dbErr } = await svc.from("agent_models").delete().eq("id", pathParts[0]);
    if (dbErr) return err(dbErr.message, 500);
    return json({ success: true });
  }

  return err("Not found", 404);
}

async function handleRoutingRules(req: Request, method: string, pathParts: string[]) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();

  if (method === "GET") {
    const { data, error: dbErr } = await svc
      .from("agent_routing_rules")
      .select("*, agent_providers(name, provider_type)")
      .eq("workspace_id", teamId)
      .order("priority", { ascending: true });

    if (dbErr) return err(dbErr.message, 500);
    return json(data || []);
  }

  if (method === "POST") {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    body.workspace_id = teamId;

    const { data, error: dbErr } = await svc.from("agent_routing_rules").insert(body).select().single();
    if (dbErr) return err(dbErr.message, 500);

    await auditLog(teamId, "routing_rule_created", auth.userId, data.id, "agent_routing_rule", { name: body.name }, req);
    return json(data);
  }

  if (method === "PATCH" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    delete body.id;
    delete body.workspace_id;

    const { data, error: dbErr } = await svc
      .from("agent_routing_rules")
      .update(body)
      .eq("id", pathParts[0])
      .eq("workspace_id", teamId)
      .select()
      .single();

    if (dbErr) return err(dbErr.message, 500);
    await auditLog(teamId, "routing_rule_updated", auth.userId, pathParts[0], "agent_routing_rule", {}, req);
    return json(data);
  }

  if (method === "DELETE" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const { error: dbErr } = await svc
      .from("agent_routing_rules")
      .delete()
      .eq("id", pathParts[0])
      .eq("workspace_id", teamId);

    if (dbErr) return err(dbErr.message, 500);
    await auditLog(teamId, "routing_rule_deleted", auth.userId, pathParts[0], "agent_routing_rule", {}, req);
    return json({ success: true });
  }

  return err("Not found", 404);
}

async function handleSafetyPolicies(req: Request, method: string, pathParts: string[]) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();

  if (method === "GET") {
    const { data, error: dbErr } = await svc
      .from("agent_safety_policies")
      .select("*")
      .eq("workspace_id", teamId)
      .order("created_at", { ascending: false });

    if (dbErr) return err(dbErr.message, 500);
    return json(data || []);
  }

  if (method === "POST") {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    body.workspace_id = teamId;
    body.created_by = auth.userId;

    const { data, error: dbErr } = await svc.from("agent_safety_policies").insert(body).select().single();
    if (dbErr) return err(dbErr.message, 500);

    await auditLog(teamId, "safety_policy_changed", auth.userId, data.id, "agent_safety_policy", { action: "created" }, req);
    return json(data);
  }

  if (method === "PATCH" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    delete body.id;
    delete body.workspace_id;

    const { data, error: dbErr } = await svc
      .from("agent_safety_policies")
      .update(body)
      .eq("id", pathParts[0])
      .eq("workspace_id", teamId)
      .select()
      .single();

    if (dbErr) return err(dbErr.message, 500);
    await auditLog(teamId, "safety_policy_changed", auth.userId, pathParts[0], "agent_safety_policy", { action: "updated" }, req);
    return json(data);
  }

  if (method === "DELETE" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const { error: dbErr } = await svc
      .from("agent_safety_policies")
      .delete()
      .eq("id", pathParts[0])
      .eq("workspace_id", teamId);

    if (dbErr) return err(dbErr.message, 500);
    await auditLog(teamId, "safety_policy_changed", auth.userId, pathParts[0], "agent_safety_policy", { action: "deleted" }, req);
    return json({ success: true });
  }

  return err("Not found", 404);
}

async function handleFallbackPolicies(req: Request, method: string, pathParts: string[]) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();

  if (method === "GET") {
    const { data, error: dbErr } = await svc
      .from("agent_fallback_policies")
      .select("*, primary:agent_providers!agent_fallback_policies_primary_provider_id_fkey(name), secondary:agent_providers!agent_fallback_policies_secondary_provider_id_fkey(name), tertiary:agent_providers!agent_fallback_policies_tertiary_provider_id_fkey(name)")
      .eq("workspace_id", teamId);

    if (dbErr) return err(dbErr.message, 500);
    return json(data || []);
  }

  if (method === "POST") {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    body.workspace_id = teamId;

    const { data, error: dbErr } = await svc.from("agent_fallback_policies").insert(body).select().single();
    if (dbErr) return err(dbErr.message, 500);

    await auditLog(teamId, "fallback_policy_changed", auth.userId, data.id, "agent_fallback_policy", { action: "created" }, req);
    return json(data);
  }

  if (method === "PATCH" && pathParts.length === 1) {
    if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);
    const body = await req.json();
    delete body.id;
    delete body.workspace_id;

    const { data, error: dbErr } = await svc
      .from("agent_fallback_policies")
      .update(body)
      .eq("id", pathParts[0])
      .eq("workspace_id", teamId)
      .select()
      .single();

    if (dbErr) return err(dbErr.message, 500);
    await auditLog(teamId, "fallback_policy_changed", auth.userId, pathParts[0], "agent_fallback_policy", { action: "updated" }, req);
    return json(data);
  }

  return err("Not found", 404);
}

async function handleLogs(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const channelType = url.searchParams.get("channel_type");
  const providerId = url.searchParams.get("provider_id");
  const decision = url.searchParams.get("decision");
  const startDate = url.searchParams.get("start_date");
  const endDate = url.searchParams.get("end_date");

  let query = svc
    .from("agent_execution_logs")
    .select("*, agent_providers(name)", { count: "exact" })
    .eq("workspace_id", teamId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (channelType) query = query.eq("channel_type", channelType);
  if (providerId) query = query.eq("provider_id", providerId);
  if (decision) query = query.eq("decision", decision);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data, error: dbErr, count } = await query;
  if (dbErr) return err(dbErr.message, 500);

  return json({ data: data || [], total: count || 0, limit, offset });
}

async function handleAuditLogs(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  if (!(await isAdmin(auth.userId, teamId))) return err("Admin access required", 403);

  const svc = getServiceClient();
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  const { data, error: dbErr } = await svc
    .from("agent_audit_logs")
    .select("*")
    .eq("workspace_id", teamId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (dbErr) return err(dbErr.message, 500);
  return json(data || []);
}

// ─── Stats endpoint for dashboard ───

async function handleStats(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized", 401);

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) return err("No workspace found", 403);

  const svc = getServiceClient();
  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data: logs } = await svc
    .from("agent_execution_logs")
    .select("decision, latency_ms, token_in, token_out, estimated_cost, provider_id, channel_type, error_code")
    .eq("workspace_id", teamId)
    .gte("created_at", since);

  const items = logs || [];
  const totalRequests = items.length;
  const successes = items.filter((l: any) => l.decision !== "failed").length;
  const failures = items.filter((l: any) => l.decision === "failed").length;
  const avgLatency = totalRequests > 0
    ? Math.round(items.reduce((s: number, l: any) => s + (l.latency_ms || 0), 0) / totalRequests)
    : 0;
  const totalTokensIn = items.reduce((s: number, l: any) => s + (l.token_in || 0), 0);
  const totalTokensOut = items.reduce((s: number, l: any) => s + (l.token_out || 0), 0);
  const totalCost = items.reduce((s: number, l: any) => s + (Number(l.estimated_cost) || 0), 0);

  const byDecision: Record<string, number> = {};
  const byProvider: Record<string, number> = {};
  const byChannel: Record<string, number> = {};

  items.forEach((l: any) => {
    byDecision[l.decision] = (byDecision[l.decision] || 0) + 1;
    if (l.provider_id) byProvider[l.provider_id] = (byProvider[l.provider_id] || 0) + 1;
    byChannel[l.channel_type] = (byChannel[l.channel_type] || 0) + 1;
  });

  return json({
    totalRequests,
    successes,
    failures,
    successRate: totalRequests > 0 ? ((successes / totalRequests) * 100).toFixed(1) : "0",
    avgLatency,
    totalTokensIn,
    totalTokensOut,
    totalCost: totalCost.toFixed(4),
    byDecision,
    byProvider,
    byChannel,
  });
}

// ─── Main Router ───

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/agent-management\/?/, "").replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    const method = req.method;

    const resource = parts[0] || "";
    const subParts = parts.slice(1);

    switch (resource) {
      case "providers":
        return await handleProviders(req, method, subParts);
      case "models":
        return await handleModels(req, method, subParts);
      case "routing-rules":
        return await handleRoutingRules(req, method, subParts);
      case "safety-policies":
        return await handleSafetyPolicies(req, method, subParts);
      case "fallback-policies":
        return await handleFallbackPolicies(req, method, subParts);
      case "logs":
        return await handleLogs(req);
      case "audit-logs":
        return await handleAuditLogs(req);
      case "stats":
        return await handleStats(req);
      default:
        return err("Not found", 404);
    }
  } catch (e) {
    console.error("agent-management error:", e);
    return err(e instanceof Error ? e.message : "Internal error", 500);
  }
});
