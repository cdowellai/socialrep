-- Create streams table for customizable column configurations
CREATE TABLE public.streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT, -- null means "all platforms"
  connected_platform_id UUID REFERENCES public.connected_platforms(id) ON DELETE SET NULL,
  interaction_types TEXT[] DEFAULT ARRAY['comment', 'message', 'review', 'mention']::TEXT[],
  filters JSONB DEFAULT '{}'::JSONB, -- Additional filters like sentiment, keywords, status
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1', -- Stream accent color
  is_collapsed BOOLEAN DEFAULT false,
  show_ai_suggestions BOOLEAN DEFAULT true,
  auto_sort_by_urgency BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_streams_user_team ON public.streams(user_id, team_id);
CREATE INDEX idx_streams_position ON public.streams(position);

-- Enable RLS
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for streams
CREATE POLICY "Users can view their own streams"
ON public.streams FOR SELECT
USING (
  auth.uid() = user_id OR 
  (team_id IS NOT NULL AND public.is_team_member(auth.uid(), team_id))
);

CREATE POLICY "Users can create their own streams"
ON public.streams FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams"
ON public.streams FOR UPDATE
USING (
  auth.uid() = user_id OR 
  (team_id IS NOT NULL AND public.is_team_admin(auth.uid(), team_id))
);

CREATE POLICY "Users can delete their own streams"
ON public.streams FOR DELETE
USING (
  auth.uid() = user_id OR 
  (team_id IS NOT NULL AND public.is_team_admin(auth.uid(), team_id))
);

-- Add trigger for updated_at
CREATE TRIGGER update_streams_updated_at
BEFORE UPDATE ON public.streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for streams
ALTER PUBLICATION supabase_realtime ADD TABLE public.streams;