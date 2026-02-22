/*
  Warnings:

  - You are about to drop the `SupplierInvoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SupplierInvoice" DROP CONSTRAINT "SupplierInvoice_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierPayment" DROP CONSTRAINT "SupplierPayment_supplierInvoiceId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "gstRate" DOUBLE PRECISION,
ADD COLUMN     "isGstEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGstInclusive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "gstRate" DOUBLE PRECISION,
ADD COLUMN     "isGstInclusive" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "SupplierInvoice";

-- DropTable
DROP TABLE "SupplierPayment";

-- CreateTable
CREATE TABLE "VendorInvoice" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "invoiceAmount" DOUBLE PRECISION NOT NULL,
    "gstAmount" DOUBLE PRECISION,
    "gstRate" DOUBLE PRECISION,
    "isGstInclusive" BOOLEAN NOT NULL DEFAULT false,
    "isGstEligible" BOOLEAN NOT NULL DEFAULT true,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outstandingAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPayment" (
    "id" TEXT NOT NULL,
    "vendorInvoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorInvoice_vendorId_idx" ON "VendorInvoice"("vendorId");

-- CreateIndex
CREATE INDEX "VendorInvoice_dueDate_idx" ON "VendorInvoice"("dueDate");

-- CreateIndex
CREATE INDEX "VendorPayment_vendorInvoiceId_idx" ON "VendorPayment"("vendorInvoiceId");

-- AddForeignKey
ALTER TABLE "VendorInvoice" ADD CONSTRAINT "VendorInvoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPayment" ADD CONSTRAINT "VendorPayment_vendorInvoiceId_fkey" FOREIGN KEY ("vendorInvoiceId") REFERENCES "VendorInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
