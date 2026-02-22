-- CreateTable
CREATE TABLE "PaymentEntry" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentEntry_invoiceId_idx" ON "PaymentEntry"("invoiceId");

-- AddForeignKey
ALTER TABLE "PaymentEntry" ADD CONSTRAINT "PaymentEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
