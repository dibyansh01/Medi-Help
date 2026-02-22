import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import VendorForm from './VendorForm'

export default async function NewVendorPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Vendor</h1>
        <p className="text-sm text-gray-500">
          Add a vendor for tracking expenses and bills
        </p>
      </div>

      <VendorForm />
    </div>
  )
}