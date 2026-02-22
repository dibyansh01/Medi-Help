-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "nextFollowUpOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowUp_invoiceId_idx" ON "FollowUp"("invoiceId");

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
