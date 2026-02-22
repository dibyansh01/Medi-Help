import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import VendorInvoiceForm from './VendorInvoiceForm';

export default async function NewVendorInvoicePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Add Vendor Invoice</h1>
      <VendorInvoiceForm vendors={vendors} />
    </div>
  );
}