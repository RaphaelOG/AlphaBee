-- AlphaBee initial schema (equivalent to prisma/schema.prisma)
-- Apply with: psql $DATABASE_URL -f prisma/migrations/0001_init.sql
-- Or prefer: npx prisma db push

CREATE TABLE IF NOT EXISTS "Parent" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Child" (
  "id" TEXT PRIMARY KEY,
  "parentId" TEXT NOT NULL REFERENCES "Parent"("id") ON DELETE CASCADE,
  "nickname" TEXT NOT NULL,
  "gradeLevel" TEXT NOT NULL DEFAULT '1',
  "avatarKey" TEXT NOT NULL DEFAULT 'bee',
  "activeUnitId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "Child_parentId_idx" ON "Child"("parentId");

CREATE TABLE IF NOT EXISTS "ChildProgress" (
  "id" TEXT PRIMARY KEY,
  "childId" TEXT NOT NULL UNIQUE REFERENCES "Child"("id") ON DELETE CASCADE,
  "honeyTotal" INTEGER NOT NULL DEFAULT 0,
  "starsTotal" INTEGER NOT NULL DEFAULT 0,
  "wordsMastered" INTEGER NOT NULL DEFAULT 0,
  "questsCompleted" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "WordMastery" (
  "id" TEXT PRIMARY KEY,
  "childId" TEXT NOT NULL REFERENCES "Child"("id") ON DELETE CASCADE,
  "word" TEXT NOT NULL,
  "gradeLevel" TEXT,
  "unitId" TEXT,
  "correctCount" INTEGER NOT NULL DEFAULT 0,
  "incorrectCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'learning',
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "masteredAt" TIMESTAMP(3),
  UNIQUE ("childId", "word")
);
CREATE INDEX IF NOT EXISTS "WordMastery_childId_status_idx" ON "WordMastery"("childId", "status");

CREATE TABLE IF NOT EXISTS "DailyStreak" (
  "id" TEXT PRIMARY KEY,
  "childId" TEXT NOT NULL UNIQUE REFERENCES "Child"("id") ON DELETE CASCADE,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastCompletedDate" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "GameSession" (
  "id" TEXT PRIMARY KEY,
  "childId" TEXT NOT NULL REFERENCES "Child"("id") ON DELETE CASCADE,
  "mode" TEXT NOT NULL,
  "questId" TEXT,
  "questTitle" TEXT,
  "wordGoal" INTEGER NOT NULL,
  "wordsCompleted" INTEGER NOT NULL,
  "honeyEarned" INTEGER NOT NULL DEFAULT 0,
  "starsEarned" INTEGER NOT NULL DEFAULT 0,
  "gradeLevel" TEXT,
  "unitId" TEXT,
  "customListId" TEXT,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "GameSession_childId_completedAt_idx" ON "GameSession"("childId", "completedAt");

CREATE TABLE IF NOT EXISTS "CustomList" (
  "id" TEXT PRIMARY KEY,
  "parentId" TEXT NOT NULL REFERENCES "Parent"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "words" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "CustomList_parentId_idx" ON "CustomList"("parentId");

CREATE TABLE IF NOT EXISTS "CustomListAssignment" (
  "id" TEXT PRIMARY KEY,
  "customListId" TEXT NOT NULL REFERENCES "CustomList"("id") ON DELETE CASCADE,
  "childId" TEXT NOT NULL REFERENCES "Child"("id") ON DELETE CASCADE,
  UNIQUE ("customListId", "childId")
);
