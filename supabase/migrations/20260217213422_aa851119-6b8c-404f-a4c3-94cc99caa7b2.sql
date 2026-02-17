
-- Agent provider types
CREATE TYPE public.agent_provider_type AS ENUM ('openclaw', 'openai', 'openai_compatible');
CREATE TYPE public.agent_action_mode AS ENUM ('draft_only', 'auto_send', 'requires_approval');
CREATE TYPE public.agent_decision AS ENUM ('sent', 'draft', 'escalated', 'failed');
CREATE TYPE public.agent_channel_type AS ENUM ('review', 'comment', 'dm');
CREATE TYPE public.agent_risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.agent_sentiment_class AS ENUM ('positive', 'neutral', 'negative', 'mixed');

-- 1) agent_providers
CREATE TABLE public.agent_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider_type agent_provider_type NOT NULL,
  base_url TEXT,
  encrypted_api_key TEXT, -- stored encrypted, never returned to client
  org_id TEXT,
  default_model TEXT,
  timeout_ms INTEGER NOT NULL DEFAULT 30000,
  max_retries INTEGER NOT NULL DEFAULT 3,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_providers_workspace ON public.agent_providers(workspace_id);
ALTER TABLE public.agent_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view providers" ON public.agent_providers
  FOR SELECT USING (is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Team admins can manage providers" ON public.agent_providers
  FOR ALL USING (is_team_admin(auth.uid(), workspace_id))
  WITH CHECK (is_team_admin(auth.uid(), workspace_id));

-- 2) agent_models
CREATE TABLE public.agent_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.agent_providers(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  context_window INTEGER,
  input_cost_per_1k NUMERIC(10,6),
  output_cost_per_1k NUMERIC(10,6),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_models_provider ON public.agent_models(provider_id);
ALTER TABLE public.agent_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view models" ON public.agent_models
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.agent_providers p WHERE p.id = agent_models.provider_id AND is_team_member(auth.uid(), p.workspace_id))
  );

CREATE POLICY "Team admins can manage models" ON public.agent_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.agent_providers p WHERE p.id = agent_models.provider_id AND is_team_admin(auth.uid(), p.workspace_id))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.agent_providers p WHERE p.id = agent_models.provider_id AND is_team_admin(auth.uid(), p.workspace_id))
  );

-- 3) agent_routing_rules
CREATE TABLE public.agent_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New Rule',
  channel_type agent_channel_type NOT NULL,
  sentiment_class agent_sentiment_class,
  risk_level agent_risk_level,
  provider_id UUID REFERENCES public.agent_providers(id) ON DELETE SET NULL,
  model_name TEXT,
  action_mode agent_action_mode NOT NULL DEFAULT 'requires_approval',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_routing_workspace ON public.agent_routing_rules(workspace_id, priority);
ALTER TABLE public.agent_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view routing rules" ON public.agent_routing_rules
  FOR SELECT USING (is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Team admins can manage routing rules" ON public.agent_routing_rules
  FOR ALL USING (is_team_admin(auth.uid(), workspace_id))
  WITH CHECK (is_team_admin(auth.uid(), workspace_id));

-- 4) agent_safety_policies
CREATE TABLE public.agent_safety_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  blocked_topics TEXT[] NOT NULL DEFAULT '{}',
  escalation_keywords TEXT[] NOT NULL DEFAULT '{}',
  pii_redaction_enabled BOOLEAN NOT NULL DEFAULT false,
  allow_auto_send_low_risk BOOLEAN NOT NULL DEFAULT true,
  allow_auto_send_medium_risk BOOLEAN NOT NULL DEFAULT false,
  hard_escalate_high_risk BOOLEAN NOT NULL DEFAULT true,
  max_response_length INTEGER DEFAULT 500,
  confidence_threshold NUMERIC(3,2) DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_safety_workspace ON public.agent_safety_policies(workspace_id);
ALTER TABLE public.agent_safety_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view safety policies" ON public.agent_safety_policies
  FOR SELECT USING (is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Team admins can manage safety policies" ON public.agent_safety_policies
  FOR ALL USING (is_team_admin(auth.uid(), workspace_id))
  WITH CHECK (is_team_admin(auth.uid(), workspace_id));

-- 5) agent_execution_logs
CREATE TABLE public.agent_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  item_id UUID,
  channel_type agent_channel_type NOT NULL,
  provider_id UUID REFERENCES public.agent_providers(id) ON DELETE SET NULL,
  model_name TEXT,
  prompt_hash TEXT,
  response_excerpt TEXT,
  latency_ms INTEGER,
  token_in INTEGER,
  token_out INTEGER,
  estimated_cost NUMERIC(10,6),
  decision agent_decision NOT NULL,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_logs_workspace ON public.agent_execution_logs(workspace_id, created_at DESC);
CREATE INDEX idx_agent_logs_provider ON public.agent_execution_logs(provider_id);
CREATE INDEX idx_agent_logs_channel ON public.agent_execution_logs(channel_type);
ALTER TABLE public.agent_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view execution logs" ON public.agent_execution_logs
  FOR SELECT USING (is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Team admins can insert execution logs" ON public.agent_execution_logs
  FOR INSERT WITH CHECK (is_team_admin(auth.uid(), workspace_id));

-- 6) agent_fallback_policies
CREATE TABLE public.agent_fallback_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  primary_provider_id UUID REFERENCES public.agent_providers(id) ON DELETE SET NULL,
  secondary_provider_id UUID REFERENCES public.agent_providers(id) ON DELETE SET NULL,
  tertiary_provider_id UUID REFERENCES public.agent_providers(id) ON DELETE SET NULL,
  failure_threshold INTEGER NOT NULL DEFAULT 3,
  cooldown_seconds INTEGER NOT NULL DEFAULT 300,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_fallback_workspace ON public.agent_fallback_policies(workspace_id);
ALTER TABLE public.agent_fallback_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view fallback policies" ON public.agent_fallback_policies
  FOR SELECT USING (is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Team admins can manage fallback policies" ON public.agent_fallback_policies
  FOR ALL USING (is_team_admin(auth.uid(), workspace_id))
  WITH CHECK (is_team_admin(auth.uid(), workspace_id));

-- 7) agent_audit_logs (immutable)
CREATE TABLE public.agent_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_id UUID,
  target_entity_id UUID,
  target_entity_type TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_audit_workspace ON public.agent_audit_logs(workspace_id, created_at DESC);
ALTER TABLE public.agent_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team admins can view audit logs" ON public.agent_audit_logs
  FOR SELECT USING (is_team_admin(auth.uid(), workspace_id));

CREATE POLICY "Team admins can insert audit logs" ON public.agent_audit_logs
  FOR INSERT WITH CHECK (is_team_admin(auth.uid(), workspace_id));

-- Updated_at triggers
CREATE TRIGGER update_agent_providers_updated_at BEFORE UPDATE ON public.agent_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_routing_rules_updated_at BEFORE UPDATE ON public.agent_routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_safety_policies_updated_at BEFORE UPDATE ON public.agent_safety_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_fallback_policies_updated_at BEFORE UPDATE ON public.agent_fallback_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
