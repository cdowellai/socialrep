import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-management`;

async function authedFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const resp = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...options.headers,
    },
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function useAgentProviders() {
  return useQuery({
    queryKey: ["agent-providers"],
    queryFn: () => authedFetch("/providers"),
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (body: any) => authedFetch("/providers", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-providers"] });
      toast({ title: "Provider created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateProvider() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => authedFetch(`/providers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-providers"] });
      toast({ title: "Provider updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteProvider() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => authedFetch(`/providers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-providers"] });
      toast({ title: "Provider deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useTestProvider() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => authedFetch(`/providers/${id}/test`, { method: "POST" }),
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Connection successful", description: `Latency: ${data.latency}ms, Models: ${data.models_available}` });
      } else {
        toast({ title: "Connection failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useAgentRoutingRules() {
  return useQuery({
    queryKey: ["agent-routing-rules"],
    queryFn: () => authedFetch("/routing-rules"),
  });
}

export function useCreateRoutingRule() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (body: any) => authedFetch("/routing-rules", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-routing-rules"] });
      toast({ title: "Rule created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => authedFetch(`/routing-rules/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-routing-rules"] }),
  });
}

export function useDeleteRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authedFetch(`/routing-rules/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-routing-rules"] }),
  });
}

export function useAgentSafetyPolicies() {
  return useQuery({
    queryKey: ["agent-safety-policies"],
    queryFn: () => authedFetch("/safety-policies"),
  });
}

export function useCreateSafetyPolicy() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (body: any) => authedFetch("/safety-policies", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-safety-policies"] });
      toast({ title: "Safety policy created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateSafetyPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => authedFetch(`/safety-policies/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-safety-policies"] }),
  });
}

export function useAgentExecutionLogs(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params || {}).toString();
  return useQuery({
    queryKey: ["agent-execution-logs", params],
    queryFn: () => authedFetch(`/logs?${searchParams}`),
  });
}

export function useAgentStats(days = 30) {
  return useQuery({
    queryKey: ["agent-stats", days],
    queryFn: () => authedFetch(`/stats?days=${days}`),
  });
}

export function useAgentAuditLogs() {
  return useQuery({
    queryKey: ["agent-audit-logs"],
    queryFn: () => authedFetch("/audit-logs"),
  });
}
