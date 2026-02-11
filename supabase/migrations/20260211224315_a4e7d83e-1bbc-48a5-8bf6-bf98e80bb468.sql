-- Add unique constraint for external_id + user_id on interactions for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_external_id_user_id 
ON public.interactions (external_id, user_id) 
WHERE external_id IS NOT NULL;