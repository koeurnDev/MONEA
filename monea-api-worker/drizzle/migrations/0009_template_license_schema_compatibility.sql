DO $$
BEGIN
  CREATE TYPE "TemplateLicenseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE "TemplateLicense"
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentOrderId" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentQr" TEXT,
  ADD COLUMN IF NOT EXISTS "bakongTrxId" TEXT,
  ADD COLUMN IF NOT EXISTS "amount" NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" "Currency" NOT NULL DEFAULT 'USD';

ALTER TABLE "TemplateLicense"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "TemplateLicense"
  ALTER COLUMN "status" TYPE "TemplateLicenseStatus"
  USING "status"::text::"TemplateLicenseStatus";

ALTER TABLE "TemplateLicense"
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

ALTER TABLE "TemplateLicense"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "eventType" DROP NOT NULL,
  ALTER COLUMN "purchaseId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "TemplateLicense_expiresAt_idx"
  ON "TemplateLicense"("expiresAt");
