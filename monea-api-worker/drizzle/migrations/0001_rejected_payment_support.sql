ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "Wedding"
  ADD COLUMN IF NOT EXISTS "paymentOrderId" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentRejectedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "RejectedPaymentReceipt" (
  "id" TEXT NOT NULL,
  "weddingId" TEXT NOT NULL,
  "receiptUrl" TEXT NOT NULL,
  "rejectedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RejectedPaymentReceipt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RejectedPaymentReceipt_weddingId_fkey"
    FOREIGN KEY ("weddingId")
    REFERENCES "Wedding"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Wedding_paymentStatus_paymentRejectedAt_idx"
  ON "Wedding"("paymentStatus", "paymentRejectedAt");

CREATE INDEX IF NOT EXISTS "RejectedPaymentReceipt_rejectedAt_idx"
  ON "RejectedPaymentReceipt"("rejectedAt");

CREATE INDEX IF NOT EXISTS "RejectedPaymentReceipt_weddingId_idx"
  ON "RejectedPaymentReceipt"("weddingId");
