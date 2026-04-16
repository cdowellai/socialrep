ALTER TABLE public.chatbot_settings
  ADD COLUMN IF NOT EXISTS booking_url TEXT,
  ADD COLUMN IF NOT EXISTS pricing_url TEXT,
  ADD COLUMN IF NOT EXISTS sales_goal TEXT NOT NULL DEFAULT 'all';