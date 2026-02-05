-- Add notification settings and sidebar ordering to streams table
ALTER TABLE public.streams 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_muted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sidebar_position INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for sidebar ordering
CREATE INDEX IF NOT EXISTS idx_streams_sidebar_position ON public.streams(user_id, sidebar_position);

-- Create a table to track user's read state for interactions within streams
CREATE TABLE IF NOT EXISTS public.stream_read_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_interaction_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(stream_id, user_id)
);

-- Enable RLS on stream_read_state
ALTER TABLE public.stream_read_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stream_read_state
CREATE POLICY "Users can view their own read state"
ON public.stream_read_state FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own read state"
ON public.stream_read_state FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read state"
ON public.stream_read_state FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own read state"
ON public.stream_read_state FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_stream_read_state_updated_at
BEFORE UPDATE ON public.stream_read_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for stream_read_state
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_read_state;

-- Update existing streams to have sidebar_position based on position
UPDATE public.streams SET sidebar_position = position WHERE sidebar_position = 0;