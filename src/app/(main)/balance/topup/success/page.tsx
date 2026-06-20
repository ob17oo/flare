import { authOptions } from "@/shared/lib/auth"
import { stripe } from "@/shared/lib/stripe"
import { prisma } from "@/shared/lib/prisma"
import { TopupSuccessPage } from "@/views"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Платеж успешен | Flare",
  description: "Пополнение баланса успешно завершено."
}

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

export default async function Success({ searchParams }: SuccessPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const { session_id } = await searchParams
  let amountPaidRub = 0

  if (session_id) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(session_id)
      amountPaidRub = parseInt(stripeSession.metadata?.rubAmount || "0", 10)

      // Safe Server-Side Fallback: if webhook is delayed or not received (e.g. CLI not running in dev)
      if (
        stripeSession.payment_status === 'paid' &&
        stripeSession.metadata?.purpose === 'deposit' &&
        stripeSession.metadata?.userId === session.user.id &&
        amountPaidRub > 0
      ) {
        await prisma.$transaction(async (tx) => {
          const deposit = await tx.deposit.findUnique({
            where: { stripeId: session_id }
          })

          if (deposit) {
            if (deposit.status === 'PENDING') {
              // Atomic check-and-update status
              const updateResult = await tx.deposit.updateMany({
                where: { id: deposit.id, status: 'PENDING' },
                data: { status: 'SUCCESS' }
              })

              if (updateResult.count > 0) {
                // Increment user balance
                await tx.user.update({
                  where: { id: session.user.id },
                  data: {
                    balance: { increment: amountPaidRub }
                  }
                })

                console.log(`[Stripe Success Fallback] Successfully credited ${amountPaidRub} RUB to user ${session.user.id}`)
              }
            }
          }
        })
      }
    } catch (err) {
      console.error("Failed to fetch Stripe session details or apply fallback for success page:", err)
    }
  }

  // Fetch the user's latest balance from the database
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true }
  })
  const newBalance = dbUser?.balance ?? session.user.balance

  return <TopupSuccessPage amountPaid={amountPaidRub} newBalance={newBalance} />
}
