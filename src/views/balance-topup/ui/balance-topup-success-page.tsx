'use client'

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ButtonComponent } from "@/shared/components"
import { Check } from "lucide-react"

interface TopupSuccessPageProps {
  amountPaid: number
  newBalance: number
}

export function TopupSuccessPage({ amountPaid, newBalance }: TopupSuccessPageProps) {
  const router = useRouter()
  const { data: session, update } = useSession()

  // Force session balance refresh on client side mount
  useEffect(() => {
    const refreshSession = async () => {
      try {
        await update({
          balance: newBalance
        })
      } catch (err) {
        console.error("Failed to update user session:", err)
      }
    }
    refreshSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBalance])

  const balance = session?.user?.balance ?? newBalance

  return (
    <div className="max-w-[420px] mx-auto py-20 text-center flex flex-col items-center gap-6 animate-fade-in">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 shadow-inner">
        <Check size={32} strokeWidth={2.5} />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">
          Баланс успешно пополнен
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          Средства успешно авторизованы и зачислены на ваш личный счет
        </p>
      </div>

      {/* Transaction Details */}
      <div className="w-full bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-5 flex flex-col gap-3.5 my-2">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-[var(--text-secondary)]">Сумма зачисления</span>
          <span className="font-extrabold text-[var(--success)] text-[15px]">
            +{amountPaid.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div className="border-t border-[var(--border-muted)]/50 pt-3 flex justify-between items-center text-[13px]">
          <span className="text-[var(--text-secondary)]">Новый баланс аккаунта</span>
          <span className="font-extrabold text-[var(--text-primary)] text-[15px]">
            {balance.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* Back button */}
      <ButtonComponent
        onClick={() => router.push('/profile')}
        color="accent"
        isFilled
        className="w-full h-11 text-[13px]"
      >
        Вернуться в профиль
      </ButtonComponent>
    </div>
  )
}
