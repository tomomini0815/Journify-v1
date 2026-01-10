-- Add showJojo column to UserSettings table
ALTER TABLE "UserSettings" 
ADD COLUMN IF NOT EXISTS "showJojo" BOOLEAN NOT NULL DEFAULT true;
