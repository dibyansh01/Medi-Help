import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getExpenseCategories } from '@/lib/services/expenseCategoryService'
import { prisma } from '@/lib/db/prisma'
import ExpenseForm from './ExpenseForm'

export default async function NewExpensePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const [categories, vendors] = await Promise.all([
    getExpenseCategories(),
    prisma.vendor.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Expense</h1>
        <p className="text-sm text-gray-500">
          Record a new business expense
        </p>
      </div>

      <ExpenseForm categories={categories} vendors={vendors} />
    </div>
  )
}