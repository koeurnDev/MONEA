-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "WeddingStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AWAITING_VERIFICATION', 'PAID');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('wedding', 'anniversary');

-- CreateEnum
CREATE TYPE "AnalyticsType" AS ENUM ('VIEW', 'MAP_CLICK', 'SAVE_DATE', 'RSVP_OPEN', 'RSVP_SUBMIT');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'KHR');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'ABA', 'Wing', 'ACLEDA', 'KHQR', 'Other');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('SCANNER', 'CASHIER', 'STAFF');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CHECK_IN', 'GIFT', 'UPDATE', 'DELETE', 'CREATE', 'PAYMENT_APPROVAL', 'LOGIN_FAILURE');

-- CreateEnum
CREATE TYPE "SecurityEvent" AS ENUM ('LOGIN_FAILED', 'LOGIN_SUCCESS', 'RATE_LIMIT_EXCEEDED', 'PASSWORD_CHANGE_SUCCESS', 'PASSWORD_CHANGE_FAILED', 'TWOFA_SETUP', 'TWOFA_VERIFY', 'TWOFA_DISABLED', 'TWOFA_VERIFY_FAILED', 'SESSION_REVOKED');

-- CreateEnum
CREATE TYPE "BroadcastType" AS ENUM ('INFO', 'WARNING', 'SUCCESS');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLOSED', 'PENDING');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "GovernanceAction" AS ENUM ('PUBLISH', 'ROLLBACK', 'CONFIG_UPDATE', 'ENABLE_2FA', 'DISABLE_2FA', 'REVOKE_SESSIONS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "telegramId" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorRecoveryCodes" TEXT,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "sessionsRevokedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "location" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "eventType" "EventType" NOT NULL DEFAULT 'wedding',
    "templateId" TEXT NOT NULL DEFAULT 'classic',
    "themeSettings" JSONB,
    "notes" TEXT,
    "weddingCode" TEXT,
    "status" "WeddingStatus" NOT NULL DEFAULT 'ACTIVE',
    "packageType" "PackageType" NOT NULL DEFAULT 'FREE',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "telegramLink" TEXT,
    "paymentInfo" TEXT,
    "paymentHash" TEXT,
    "bakongTrxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationAnalytics" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "type" "AnalyticsType" NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "deviceType" "DeviceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "publicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weddingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "group" TEXT,
    "source" TEXT,
    "weddingId" TEXT NOT NULL,
    "hasArrived" BOOLEAN NOT NULL DEFAULT false,
    "arrivedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "rsvpStatus" "RsvpStatus" DEFAULT 'PENDING',
    "adultsCount" INTEGER NOT NULL DEFAULT 1,
    "childrenCount" INTEGER DEFAULT 0,
    "rsvpNotes" TEXT,
    "rsvpAt" TIMESTAMP(3),
    "guestCode" TEXT,
    "sequenceNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL,
    "method" "PaymentMethod",
    "weddingId" TEXT NOT NULL,
    "guestId" TEXT,
    "sequenceNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "type" "MediaType" NOT NULL,
    "caption" TEXT,
    "weddingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestbookEntry" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "voiceUrl" TEXT,
    "weddingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "pin" TEXT,
    "role" "StaffRole" NOT NULL DEFAULT 'STAFF',
    "weddingId" TEXT NOT NULL,
    "accessToken" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorRecoveryCodes" TEXT,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "sessionsRevokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "description" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "weddingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistedIP" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistedIP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpSecurity" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "lastAttempt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpSecurity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityLog" (
    "id" TEXT NOT NULL,
    "event" "SecurityEvent" NOT NULL,
    "ip" TEXT NOT NULL,
    "geoIp" TEXT,
    "userAgent" TEXT,
    "email" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'GLOBAL',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceStart" TIMESTAMP(3),
    "maintenanceEnd" TIMESTAMP(3),
    "allowNewSignups" BOOLEAN NOT NULL DEFAULT true,
    "globalCheckIn" BOOLEAN NOT NULL DEFAULT true,
    "stadPrice" DOUBLE PRECISION NOT NULL DEFAULT 9.0,
    "proPrice" DOUBLE PRECISION NOT NULL DEFAULT 19.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "BroadcastType" NOT NULL DEFAULT 'INFO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scheduledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "weddingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemVersion" (
    "id" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "configData" JSONB NOT NULL,
    "description" TEXT,
    "isStable" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceLog" (
    "id" TEXT NOT NULL,
    "action" "GovernanceAction" NOT NULL,
    "details" JSONB NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingTemplateVersion" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "themeData" JSONB NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySecuritySummary" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalLogins" INTEGER NOT NULL,
    "failedAttempts" INTEGER NOT NULL,
    "blockedIps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySecuritySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_weddingCode_key" ON "Wedding"("weddingCode");

-- CreateIndex
CREATE INDEX "Wedding_userId_idx" ON "Wedding"("userId");

-- CreateIndex
CREATE INDEX "Wedding_status_idx" ON "Wedding"("status");

-- CreateIndex
CREATE INDEX "InvitationAnalytics_weddingId_idx" ON "InvitationAnalytics"("weddingId");

-- CreateIndex
CREATE INDEX "InvitationAnalytics_createdAt_idx" ON "InvitationAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "InvitationAnalytics_weddingId_type_createdAt_idx" ON "InvitationAnalytics"("weddingId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_weddingId_idx" ON "Activity"("weddingId");

-- CreateIndex
CREATE INDEX "Guest_weddingId_idx" ON "Guest"("weddingId");

-- CreateIndex
CREATE INDEX "Guest_hasArrived_idx" ON "Guest"("hasArrived");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_weddingId_guestCode_key" ON "Guest"("weddingId", "guestCode");

-- CreateIndex
CREATE INDEX "Gift_weddingId_idx" ON "Gift"("weddingId");

-- CreateIndex
CREATE INDEX "Gift_guestId_idx" ON "Gift"("guestId");

-- CreateIndex
CREATE INDEX "Gift_method_idx" ON "Gift"("method");

-- CreateIndex
CREATE INDEX "Gift_currency_idx" ON "Gift"("currency");

-- CreateIndex
CREATE INDEX "GalleryItem_weddingId_idx" ON "GalleryItem"("weddingId");

-- CreateIndex
CREATE INDEX "GuestbookEntry_weddingId_idx" ON "GuestbookEntry"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_accessToken_key" ON "Staff"("accessToken");

-- CreateIndex
CREATE INDEX "Staff_weddingId_idx" ON "Staff"("weddingId");

-- CreateIndex
CREATE INDEX "Log_weddingId_idx" ON "Log"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedIP_ip_key" ON "BlacklistedIP"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "IpSecurity_ip_key" ON "IpSecurity"("ip");

-- CreateIndex
CREATE INDEX "SecurityLog_event_idx" ON "SecurityLog"("event");

-- CreateIndex
CREATE INDEX "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityLog_ip_idx" ON "SecurityLog"("ip");

-- CreateIndex
CREATE INDEX "SecurityLog_email_idx" ON "SecurityLog"("email");

-- CreateIndex
CREATE INDEX "SupportTicket_weddingId_idx" ON "SupportTicket"("weddingId");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "GovernanceLog_actorId_idx" ON "GovernanceLog"("actorId");

-- CreateIndex
CREATE INDEX "WeddingTemplateVersion_weddingId_idx" ON "WeddingTemplateVersion"("weddingId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySecuritySummary_date_key" ON "DailySecuritySummary"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- AddForeignKey
ALTER TABLE "Wedding" ADD CONSTRAINT "Wedding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationAnalytics" ADD CONSTRAINT "InvitationAnalytics_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestbookEntry" ADD CONSTRAINT "GuestbookEntry_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingTemplateVersion" ADD CONSTRAINT "WeddingTemplateVersion_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
