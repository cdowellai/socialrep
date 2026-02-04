-- Add auto-response delay setting to profiles table
ALTER TABLE public.profiles
ADD COLUMN auto_response_delay_ms integer NOT NULL DEFAULT 2000;

-- Add a comment explaining the column
COMMENT ON COLUMN public.profiles.auto_response_delay_ms IS 'Delay in milliseconds before sending auto-responses (0-30000ms)';