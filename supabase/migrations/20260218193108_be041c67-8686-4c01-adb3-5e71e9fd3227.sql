-- Add unique constraint for deduplication during Facebook sync
CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_external_id_user_id 
ON public.interactions (external_id, user_id) 
WHERE external_id IS NOT NULL;