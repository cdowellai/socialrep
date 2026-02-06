-- Create chatbot_knowledge_base table for storing training data
CREATE TABLE public.chatbot_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('faq', 'qa_pair', 'document')),
  title TEXT,
  question TEXT,
  answer TEXT,
  content TEXT,
  source_filename TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own knowledge base entries"
  ON public.chatbot_knowledge_base FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own knowledge base entries"
  ON public.chatbot_knowledge_base FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge base entries"
  ON public.chatbot_knowledge_base FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge base entries"
  ON public.chatbot_knowledge_base FOR DELETE
  USING (auth.uid() = user_id);

-- Add columns to chatbot_settings
ALTER TABLE public.chatbot_settings 
ADD COLUMN IF NOT EXISTS human_handoff_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS handoff_keywords TEXT[] DEFAULT ARRAY['speak to human', 'talk to agent', 'real person', 'customer service', 'speak to someone'];

-- Add columns to chatbot_conversations for resolution tracking
ALTER TABLE public.chatbot_conversations
ADD COLUMN IF NOT EXISTS resolution_type TEXT DEFAULT 'pending' CHECK (resolution_type IN ('bot', 'human', 'pending')),
ADD COLUMN IF NOT EXISTS handed_off_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interaction_id UUID REFERENCES public.interactions(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_user_id ON public.chatbot_knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_entry_type ON public.chatbot_knowledge_base(entry_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_resolution ON public.chatbot_conversations(resolution_type);

-- Trigger for updated_at
CREATE TRIGGER update_chatbot_knowledge_base_updated_at
  BEFORE UPDATE ON public.chatbot_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();