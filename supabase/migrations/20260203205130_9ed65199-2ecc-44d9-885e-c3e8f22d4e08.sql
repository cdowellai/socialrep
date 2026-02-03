-- Automation Rules Table
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('sentiment', 'keyword', 'platform', 'time_based')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL CHECK (action_type IN ('auto_respond', 'escalate', 'archive', 'notify', 'tag')),
  action_config JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Brand Voice Samples for training
CREATE TABLE public.brand_voice_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sample_type TEXT NOT NULL CHECK (sample_type IN ('response', 'guideline', 'keyword', 'phrase')),
  content TEXT NOT NULL,
  context TEXT,
  sentiment TEXT,
  platform TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voice_samples ENABLE ROW LEVEL SECURITY;

-- Automation Rules policies
CREATE POLICY "Users can view own automation rules" ON public.automation_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own automation rules" ON public.automation_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automation rules" ON public.automation_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own automation rules" ON public.automation_rules FOR DELETE USING (auth.uid() = user_id);

-- Brand Voice Samples policies
CREATE POLICY "Users can view own brand voice samples" ON public.brand_voice_samples FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own brand voice samples" ON public.brand_voice_samples FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand voice samples" ON public.brand_voice_samples FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand voice samples" ON public.brand_voice_samples FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();