-- Create AI response feedback table for feedback loops
CREATE TABLE public.ai_response_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interaction_id UUID REFERENCES public.interactions(id) ON DELETE CASCADE,
  original_response TEXT NOT NULL,
  edited_response TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('accepted', 'edited', 'rejected')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_response_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own feedback" ON public.ai_response_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.ai_response_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for analytics queries
CREATE INDEX idx_ai_feedback_user ON public.ai_response_feedback(user_id);
CREATE INDEX idx_ai_feedback_type ON public.ai_response_feedback(feedback_type);
CREATE INDEX idx_ai_feedback_created ON public.ai_response_feedback(created_at DESC);

-- Add lead_keywords to profiles for auto-detection
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lead_keywords TEXT[] DEFAULT ARRAY['pricing', 'price', 'cost', 'buy', 'purchase', 'interested', 'demo', 'quote', 'trial'];