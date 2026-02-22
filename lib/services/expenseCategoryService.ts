import {prisma} from '@/lib/db/prisma';


export async function getExpenseCategories() {
  return prisma.expenseCategory.findMany({
    orderBy: { name: 'asc' },
  });
}