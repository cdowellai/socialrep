-- Create interaction_replies table to store replies to interactions
CREATE TABLE public.interaction_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID NOT NULL REFERENCES public.interactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  platform_reply_id TEXT, -- ID of the reply on the external platform
  platform_status TEXT DEFAULT 'pending' CHECK (platform_status IN ('pending', 'sent', 'failed', 'not_connected')),
  platform_error TEXT, -- Error message if platform API fails
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add resolution fields to interactions table
ALTER TABLE public.interactions 
ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS resolved_by UUID,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Enable RLS on interaction_replies
ALTER TABLE public.interaction_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interaction_replies
CREATE POLICY "Users can view replies for their interactions"
ON public.interaction_replies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.interactions i 
    WHERE i.id = interaction_id AND i.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.interactions i ON i.user_id = tm.user_id
    WHERE i.id = interaction_id 
      AND tm.team_id = public.get_user_team_id(auth.uid())
      AND tm.accepted_at IS NOT NULL
  )
);

CREATE POLICY "Users can create replies for their interactions"
ON public.interaction_replies
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.interactions i 
      WHERE i.id = interaction_id AND i.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.interactions i ON i.user_id = tm.user_id
      WHERE i.id = interaction_id 
        AND tm.team_id = public.get_user_team_id(auth.uid())
        AND tm.accepted_at IS NOT NULL
    )
  )
);

CREATE POLICY "Users can update their own replies"
ON public.interaction_replies
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
ON public.interaction_replies
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update reply_count on interactions
CREATE OR REPLACE FUNCTION public.update_interaction_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.interactions 
    SET reply_count = COALESCE(reply_count, 0) + 1 
    WHERE id = NEW.interaction_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.interactions 
    SET reply_count = GREATEST(COALESCE(reply_count, 0) - 1, 0) 
    WHERE id = OLD.interaction_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for reply count updates
CREATE TRIGGER update_reply_count_trigger
AFTER INSERT OR DELETE ON public.interaction_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_interaction_reply_count();

-- Create trigger for updated_at on interaction_replies
CREATE TRIGGER update_interaction_replies_updated_at
BEFORE UPDATE ON public.interaction_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_interaction_replies_interaction_id ON public.interaction_replies(interaction_id);
CREATE INDEX idx_interaction_replies_user_id ON public.interaction_replies(user_id);
CREATE INDEX idx_interactions_resolved ON public.interactions(resolved) WHERE resolved = true;

-- Enable realtime for interaction_replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.interaction_replies;