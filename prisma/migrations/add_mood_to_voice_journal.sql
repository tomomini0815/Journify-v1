-- Add mood column to VoiceJournal table
-- This migration adds an optional mood field (1-10 scale) to voice journals

ALTER TABLE "VoiceJournal" ADD COLUMN IF NOT EXISTS "mood" INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN "VoiceJournal"."mood" IS 'User mood rating on a 1-10 scale';
