-- ADVENTURE MODE Database Migration
-- Execute this SQL in Supabase Studio SQL Editor

-- ============================================
-- Companion System (Pets)
-- ============================================

CREATE TABLE IF NOT EXISTS "Companion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "rarity" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "baseStats" JSONB NOT NULL,
  "skills" JSONB NOT NULL,
  "theme" TEXT NOT NULL DEFAULT 'space',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserCompanion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "companionId" TEXT NOT NULL,
  "nickname" TEXT,
  "level" INTEGER NOT NULL DEFAULT 1,
  "experience" INTEGER NOT NULL DEFAULT 0,
  "happiness" INTEGER NOT NULL DEFAULT 50,
  "energy" INTEGER NOT NULL DEFAULT 50,
  "loyalty" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastFedAt" TIMESTAMP(3),
  "lastPlayedAt" TIMESTAMP(3),
  CONSTRAINT "UserCompanion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserCompanion_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "Companion"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserCompanion_userId_companionId_key" ON "UserCompanion"("userId", "companionId");
CREATE INDEX IF NOT EXISTS "UserCompanion_userId_idx" ON "UserCompanion"("userId");
CREATE INDEX IF NOT EXISTS "UserCompanion_isActive_idx" ON "UserCompanion"("isActive");

-- ============================================
-- Home Decoration System
-- ============================================

CREATE TABLE IF NOT EXISTS "HomeDecoration" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "theme" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "rarity" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "unlockLevel" INTEGER NOT NULL DEFAULT 1,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserDecoration" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "decorationId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserDecoration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserDecoration_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "HomeDecoration"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserDecoration_userId_decorationId_key" ON "UserDecoration"("userId", "decorationId");
CREATE INDEX IF NOT EXISTS "UserDecoration_userId_idx" ON "UserDecoration"("userId");

CREATE TABLE IF NOT EXISTS "UserHomeLayout" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "theme" TEXT NOT NULL DEFAULT 'space',
  "layout" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserHomeLayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- Fishing Mini-Game
-- ============================================

CREATE TABLE IF NOT EXISTS "Fish" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "rarity" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "minSize" INTEGER NOT NULL,
  "maxSize" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "habitat" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "FishCatch" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "fishId" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "weight" INTEGER,
  "caughtAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FishCatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FishCatch_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "FishCatch_userId_idx" ON "FishCatch"("userId");
CREATE INDEX IF NOT EXISTS "FishCatch_fishId_idx" ON "FishCatch"("fishId");

CREATE TABLE IF NOT EXISTS "UserFishingStats" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "totalCatches" INTEGER NOT NULL DEFAULT 0,
  "biggestCatch" INTEGER NOT NULL DEFAULT 0,
  "fishingLevel" INTEGER NOT NULL DEFAULT 1,
  "fishingExp" INTEGER NOT NULL DEFAULT 0,
  "baitCount" INTEGER NOT NULL DEFAULT 10,
  "lastBaitRefill" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserFishingStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- Gardening Mini-Game
-- ============================================

CREATE TABLE IF NOT EXISTS "Plant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "growthTime" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "seedCost" INTEGER NOT NULL,
  "harvestValue" INTEGER NOT NULL,
  "rarity" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "UserPlant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "plantId" TEXT NOT NULL,
  "plotNumber" INTEGER NOT NULL,
  "plantedAt" TIMESTAMP(3) NOT NULL,
  "wateredAt" TIMESTAMP(3),
  "harvestedAt" TIMESTAMP(3),
  "stage" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "UserPlant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserPlant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserPlant_userId_plotNumber_key" ON "UserPlant"("userId", "plotNumber");
CREATE INDEX IF NOT EXISTS "UserPlant_userId_idx" ON "UserPlant"("userId");

CREATE TABLE IF NOT EXISTS "UserGardenStats" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "totalHarvests" INTEGER NOT NULL DEFAULT 0,
  "gardenLevel" INTEGER NOT NULL DEFAULT 1,
  "gardenExp" INTEGER NOT NULL DEFAULT 0,
  "seedInventory" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserGardenStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- Verification
-- ============================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'Companion', 'UserCompanion', 
  'HomeDecoration', 'UserDecoration', 'UserHomeLayout',
  'Fish', 'FishCatch', 'UserFishingStats',
  'Plant', 'UserPlant', 'UserGardenStats'
)
ORDER BY table_name;
