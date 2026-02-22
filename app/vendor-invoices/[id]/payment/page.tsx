import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import VendorPaymentForm from './PaymentForm'

export default async function AddVendorPaymentPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const session = await getServerSession()
    if (!session) redirect('/login')

    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">
                Add Vendor Payment
            </h1>

            <VendorPaymentForm invoiceId={id} />
        </div>
    )
}
