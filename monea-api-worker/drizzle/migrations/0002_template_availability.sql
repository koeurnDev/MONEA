ALTER TABLE "SystemConfig"
  ADD COLUMN IF NOT EXISTS "templateAvailability" JSONB;

ALTER TABLE "SystemConfig"
  ADD COLUMN IF NOT EXISTS "templateMetadata" JSONB;
