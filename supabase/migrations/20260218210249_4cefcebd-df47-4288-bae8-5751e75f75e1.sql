
-- Integration run logs for observability
CREATE TABLE public.integration_run_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  run_type TEXT NOT NULL DEFAULT 'sync', -- 'sync', 'diagnostics', 'reply'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'success', 'partial', 'failed'
  fetched_count INTEGER DEFAULT 0,
  inserted_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  token_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.integration_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own run logs"
  ON public.integration_run_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own run logs"
  ON public.integration_run_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_integration_run_logs_user ON public.integration_run_logs(user_id, platform, created_at DESC);
