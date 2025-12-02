-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "timeframe" TEXT NOT NULL DEFAULT 'short';

-- CreateIndex
CREATE INDEX "Goal_userId_timeframe_idx" ON "Goal"("userId", "timeframe");
