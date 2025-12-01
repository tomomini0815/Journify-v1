-- CreateIndex
CREATE INDEX "Goal_userId_progress_idx" ON "Goal"("userId", "progress");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_mood_idx" ON "JournalEntry"("userId", "mood");
