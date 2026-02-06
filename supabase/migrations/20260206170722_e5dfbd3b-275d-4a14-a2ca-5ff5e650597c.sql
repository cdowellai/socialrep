-- Create lead_activities table for tracking notes, status changes, and interactions
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'status_change', 'email_sent', 'call', 'meeting', 'interaction_linked', 'created')),
  content TEXT,
  old_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_activities
CREATE POLICY "Users can view activities for their leads"
ON public.lead_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_activities.lead_id
    AND leads.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create activities for their leads"
ON public.lead_activities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_activities.lead_id
    AND leads.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete activities for their leads"
ON public.lead_activities
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_activities.lead_id
    AND leads.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- Add score breakdown columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score_engagement INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_sentiment INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_profile INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_recency INTEGER DEFAULT 0;

-- Create lead_interactions junction table for multiple linked interactions
CREATE TABLE public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  interaction_id UUID NOT NULL REFERENCES public.interactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, interaction_id)
);

-- Enable RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_interactions
CREATE POLICY "Users can view interactions for their leads"
ON public.lead_interactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_interactions.lead_id
    AND leads.user_id = auth.uid()
  )
);

CREATE POLICY "Users can link interactions to their leads"
ON public.lead_interactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_interactions.lead_id
    AND leads.user_id = auth.uid()
  )
);

CREATE POLICY "Users can unlink interactions from their leads"
ON public.lead_interactions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = lead_interactions.lead_id
    AND leads.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);