-- Add tiktok and youtube to the interaction_platform enum
ALTER TYPE interaction_platform ADD VALUE IF NOT EXISTS 'tiktok';
ALTER TYPE interaction_platform ADD VALUE IF NOT EXISTS 'youtube';