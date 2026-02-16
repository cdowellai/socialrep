
-- Table for temporary assistant access records
CREATE TABLE public.assistant_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'operator', 'admin')),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'expired')),
  auth_user_id UUID,
  magic_link_token TEXT UNIQUE,
  magic_link_expires_at TIMESTAMPTZ,
  temp_password_hash TEXT,
  force_password_reset BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_access ENABLE ROW LEVEL SECURITY;

-- Only team admins/owners can manage assistant access
CREATE POLICY "Team admins can manage assistant access"
  ON public.assistant_access
  FOR ALL
  USING (
    public.is_team_admin(auth.uid(), team_id)
  )
  WITH CHECK (
    public.is_team_admin(auth.uid(), team_id)
  );

-- Audit log table
CREATE TABLE public.assistant_access_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_id UUID REFERENCES public.assistant_access(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('access_created', 'access_used', 'access_revoked', 'access_expired', 'access_extended', 'link_resent')),
  actor_id UUID,
  target_email TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_access_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team admins can view audit logs"
  ON public.assistant_access_audit_logs
  FOR SELECT
  USING (
    public.is_team_admin(auth.uid(), team_id)
  );

-- Insert-only for service role (edge functions)
CREATE POLICY "Service can insert audit logs"
  ON public.assistant_access_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Updated_at trigger for assistant_access
CREATE TRIGGER update_assistant_access_updated_at
  BEFORE UPDATE ON public.assistant_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-expire function
CREATE OR REPLACE FUNCTION public.check_assistant_access_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.assistant_access
  SET status = 'expired'
  WHERE status IN ('pending', 'active')
    AND expires_at < now();
END;
$$;
