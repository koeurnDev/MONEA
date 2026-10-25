-- CreateTable: TemplatePreview
-- Purpose: Store template preview data created by admins for users to view before selecting templates
-- Admin designs full wedding preview using /dashboard/design?templatePreview=templateId
-- Users can preview templates from template selection step

CREATE TABLE "TemplatePreview" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "previewData" JSONB NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplatePreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePreview_templateId_key" ON "TemplatePreview"("templateId");

-- CreateIndex
CREATE INDEX "TemplatePreview_templateId_idx" ON "TemplatePreview"("templateId");

-- CreateIndex
CREATE INDEX "TemplatePreview_updatedAt_idx" ON "TemplatePreview"("updatedAt");
