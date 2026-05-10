-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "priceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripePriceId" TEXT,
    "messagesPerDay" INTEGER NOT NULL DEFAULT 50,
    "aiTokensPerDay" INTEGER NOT NULL DEFAULT 30000,
    "storageBytes" BIGINT NOT NULL DEFAULT 104857600,
    "maxActiveReminders" INTEGER NOT NULL DEFAULT 5,
    "memoryRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "maxDocumentsPerMonth" INTEGER NOT NULL DEFAULT 3,
    "trialDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "planId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "messagesUsedToday" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsedToday" INTEGER NOT NULL DEFAULT 0,
    "documentsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "storageUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" TIMESTAMP(3),
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "googleDriveFolderId" TEXT,
    "gmailConnected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceFileId" TEXT,
    "embedding" vector(1536),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "repeat" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "storageBackend" TEXT NOT NULL DEFAULT 'minio',
    "storagePath" TEXT,
    "driveFileId" TEXT,
    "driveWebViewLink" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_whatsappNumber_key" ON "User"("whatsappNumber");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt");
CREATE INDEX "Memory_userId_idx" ON "Memory"("userId");
CREATE INDEX "Appointment_userId_scheduledAt_idx" ON "Appointment"("userId", "scheduledAt");
CREATE INDEX "Appointment_status_scheduledAt_idx" ON "Appointment"("status", "scheduledAt");
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");
CREATE INDEX "Reminder_status_scheduledAt_idx" ON "Reminder"("status", "scheduledAt");
CREATE INDEX "UserFile_userId_idx" ON "UserFile"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed dos planos
INSERT INTO "Plan" (id, name, "displayName", "priceMonthly", "messagesPerDay", "aiTokensPerDay", "storageBytes", "maxActiveReminders", "memoryRetentionDays", "maxDocumentsPerMonth", "trialDays")
VALUES
  (gen_random_uuid()::text, 'free', 'Grátis', 0, 50, 30000, 104857600, 5, 30, 3, 7),
  (gen_random_uuid()::text, 'pro', 'Pro', 29, 99999, 0, 10737418240, 9999, 9999, 9999, 7)
ON CONFLICT (name) DO NOTHING;
