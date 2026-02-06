-- Add is_internal column to interaction_replies for internal notes
ALTER TABLE public.interaction_replies 
ADD COLUMN IF NOT EXISTS is_internal boolean NOT NULL DEFAULT false;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_interaction_replies_is_internal 
ON public.interaction_replies(interaction_id, is_internal);

-- Comment for documentation
COMMENT ON COLUMN public.interaction_replies.is_internal IS 'If true, this is an internal note not sent to the customer';