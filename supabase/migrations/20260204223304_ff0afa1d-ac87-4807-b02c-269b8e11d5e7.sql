-- Create chatbot_conversations table to store chat sessions
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_messages table to store individual messages
CREATE TABLE public.chatbot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_settings table for widget configuration
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  widget_title TEXT NOT NULL DEFAULT 'Chat with us',
  welcome_message TEXT NOT NULL DEFAULT 'Hi! How can I help you today?',
  primary_color TEXT DEFAULT '#3b82f6',
  position TEXT NOT NULL DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left')),
  collect_email BOOLEAN NOT NULL DEFAULT false,
  collect_name BOOLEAN NOT NULL DEFAULT false,
  auto_reply_delay_ms INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for chatbot_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.chatbot_conversations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" 
ON public.chatbot_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.chatbot_conversations FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for chatbot_messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.chatbot_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.chatbot_conversations 
  WHERE id = chatbot_messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.chatbot_messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chatbot_conversations 
  WHERE id = chatbot_messages.conversation_id AND user_id = auth.uid()
));

-- RLS policies for chatbot_settings
CREATE POLICY "Users can view their own settings" 
ON public.chatbot_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.chatbot_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.chatbot_settings FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_messages;

-- Create indexes
CREATE INDEX idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_status ON public.chatbot_conversations(status);
CREATE INDEX idx_chatbot_messages_conversation_id ON public.chatbot_messages(conversation_id);
CREATE INDEX idx_chatbot_messages_created_at ON public.chatbot_messages(created_at);