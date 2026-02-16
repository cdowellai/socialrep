
-- Fix: restrict audit log inserts to authenticated users who are team admins
DROP POLICY "Service can insert audit logs" ON public.assistant_access_audit_logs;

CREATE POLICY "Team admins can insert audit logs"
  ON public.assistant_access_audit_logs
  FOR INSERT
  WITH CHECK (
    public.is_team_admin(auth.uid(), team_id)
  );
