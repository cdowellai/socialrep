-- Add notification preferences and brand AI settings to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS brand_voice_description text,
ADD COLUMN IF NOT EXISTS response_tone text DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS response_length text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS use_emojis boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS response_signature text,
ADD COLUMN IF NOT EXISTS notify_urgent_interactions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_reviews_below_stars integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS notify_daily_digest boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_browser_push boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_slack_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_slack_webhook_url text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';