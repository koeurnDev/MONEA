CREATE TABLE IF NOT EXISTS "UserTemplateAccess" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "templateId" text NOT NULL,
  "grantedBy" text,
  "revokedAt" timestamp,
  "revokedBy" text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserTemplateAccess_userId_templateId_key"
  ON "UserTemplateAccess"("userId", "templateId");
CREATE INDEX IF NOT EXISTS "UserTemplateAccess_userId_revokedAt_idx"
  ON "UserTemplateAccess"("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "UserTemplateAccess_templateId_idx"
  ON "UserTemplateAccess"("templateId");
