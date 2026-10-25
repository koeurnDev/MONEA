ALTER TABLE "TemplateLicense"
  ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptReference" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptReviewStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "receiptSubmittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "receiptReviewedAt" TIMESTAMP(3);
