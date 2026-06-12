import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { BalanceTopupPage } from "@/views"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Пополнение баланса | Flare",
  description: "Пополнение личного счета аккаунта Flare через Stripe."
}

export default async function Topup() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch deposit history for the current user
  const deposits = await prisma.deposit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  // Format Date objects to satisfy JSON serialization bounds in Next.js Server Components
  const serializedDeposits = deposits.map((dep) => ({
    ...dep,
    createdAt: dep.createdAt,
    updatedAt: dep.updatedAt
  }))

  return <BalanceTopupPage initialDeposits={serializedDeposits} />
}
