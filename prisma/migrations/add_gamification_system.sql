-- Add gamification fields to UserStats
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "strength" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "vitality" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "intelligence" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "charisma" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "luck" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "spirit" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "gold" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "crystals" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "fame" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserStats" ADD COLUMN IF NOT EXISTS "lastXPUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for rankings
CREATE INDEX IF NOT EXISTS "UserStats_level_idx" ON "UserStats"("level");
CREATE INDEX IF NOT EXISTS "UserStats_totalXP_idx" ON "UserStats"("totalXP");

-- Create Quest table
CREATE TABLE IF NOT EXISTS "Quest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '⚔️',
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "requirement" JSONB NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "xpReward" INTEGER NOT NULL,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "statRewards" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Quest_type_isActive_idx" ON "Quest"("type", "isActive");
CREATE INDEX IF NOT EXISTS "Quest_category_idx" ON "Quest"("category");

-- Create UserQuest table
CREATE TABLE IF NOT EXISTS "UserQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserQuest_userId_questId_key" ON "UserQuest"("userId", "questId");
CREATE INDEX IF NOT EXISTS "UserQuest_userId_isCompleted_idx" ON "UserQuest"("userId", "isCompleted");
CREATE INDEX IF NOT EXISTS "UserQuest_isCompleted_lastResetAt_idx" ON "UserQuest"("isCompleted", "lastResetAt");

-- Create Achievement table
CREATE TABLE IF NOT EXISTS "Achievement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "requirement" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "statRewards" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Achievement_key_key" ON "Achievement"("key");
CREATE INDEX IF NOT EXISTS "Achievement_rarity_idx" ON "Achievement"("rarity");

-- Create UserAchievement table
CREATE TABLE IF NOT EXISTS "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE INDEX IF NOT EXISTS "UserAchievement_userId_idx" ON "UserAchievement"("userId");
CREATE INDEX IF NOT EXISTS "UserAchievement_userId_isEquipped_idx" ON "UserAchievement"("userId", "isEquipped");

-- Add foreign keys
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
