-- Create review_requests table to track sent review request emails/SMS
CREATE TABLE public.review_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  message_template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  platform TEXT NOT NULL DEFAULT 'google',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_recipient CHECK (recipient_email IS NOT NULL OR recipient_phone IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create own review requests"
  ON public.review_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own review requests"
  ON public.review_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own review requests"
  ON public.review_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own review requests"
  ON public.review_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Create review_links table to store generated review links
CREATE TABLE public.review_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  review_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create own review links"
  ON public.review_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own review links"
  ON public.review_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own review links"
  ON public.review_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own review links"
  ON public.review_links FOR DELETE
  USING (auth.uid() = user_id);

-- Add response tracking columns to reviews table if they don't exist
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS response_by UUID,
  ADD COLUMN IF NOT EXISTS response_type TEXT DEFAULT 'manual';

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_review_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_review_requests_updated_at
  BEFORE UPDATE ON public.review_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_requests_updated_at();

CREATE TRIGGER update_review_links_updated_at
  BEFORE UPDATE ON public.review_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_requests_updated_at();