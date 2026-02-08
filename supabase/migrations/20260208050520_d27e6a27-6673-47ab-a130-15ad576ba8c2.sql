-- Create status enum for scheduled posts
CREATE TYPE public.post_status AS ENUM ('draft', 'pending_approval', 'scheduled', 'publishing', 'published', 'failed', 'cancelled');

-- Create scheduled_posts table
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  
  -- Content
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  link_url TEXT,
  link_preview JSONB,
  
  -- Target platforms and accounts
  platforms TEXT[] NOT NULL DEFAULT '{}',
  platform_account_ids UUID[] DEFAULT '{}',
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB,
  optimal_time_enabled BOOLEAN DEFAULT FALSE,
  
  -- AI features
  ai_generated BOOLEAN DEFAULT FALSE,
  source_interaction_id UUID REFERENCES public.interactions(id),
  predicted_engagement JSONB,
  
  -- Status and workflow
  status post_status DEFAULT 'draft',
  approval_required BOOLEAN DEFAULT FALSE,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Publishing results
  published_at TIMESTAMPTZ,
  platform_post_ids JSONB DEFAULT '{}',
  publish_errors JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own posts" 
ON public.scheduled_posts 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Users can create their own posts" 
ON public.scheduled_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.scheduled_posts 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Users can delete their own posts" 
ON public.scheduled_posts 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_team_admin(auth.uid(), team_id));

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_posts_updated_at
BEFORE UPDATE ON public.scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create post_usage tracking (for free tier limits)
CREATE TABLE public.post_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  posts_used INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
  period_end TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Enable RLS
ALTER TABLE public.post_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_usage
CREATE POLICY "Users can view their own post usage" 
ON public.post_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post usage" 
ON public.post_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post usage" 
ON public.post_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to increment post usage
CREATE OR REPLACE FUNCTION public.increment_post_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.post_usage (user_id, posts_used, period_start, period_end)
  VALUES (p_user_id, 1, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET 
    posts_used = post_usage.posts_used + 1,
    updated_at = now();
END;
$$;

-- Function to get user's post usage
CREATE OR REPLACE FUNCTION public.get_user_post_usage(p_user_id uuid)
RETURNS TABLE(posts_used integer, period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pu.posts_used, pu.period_start, pu.period_end
  FROM public.post_usage pu
  WHERE pu.user_id = p_user_id 
    AND pu.period_start = date_trunc('month', now())
  LIMIT 1;
END;
$$;

-- Add max_posts column to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_posts INTEGER DEFAULT 5;

-- Update existing plans with post limits
UPDATE public.plans SET max_posts = 5 WHERE name = 'starter';
UPDATE public.plans SET max_posts = 50 WHERE name = 'professional';
UPDATE public.plans SET max_posts = -1 WHERE name = 'agency';

-- Enable realtime for scheduled_posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_posts;