'use client'

import { useRouter } from "next/navigation"
import { ButtonComponent } from "@/shared/components"
import { AlertTriangle } from "lucide-react"

export function TopupCancelPage() {
  const router = useRouter()

  return (
    <div className="max-w-[420px] mx-auto py-20 text-center flex flex-col items-center gap-6 animate-fade-in">
      {/* Warning Icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20 shadow-inner">
        <AlertTriangle size={30} />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">
          Платеж отменен
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          Процесс пополнения личного счета был прерван. Баланс вашего аккаунта остался без изменений.
        </p>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-2.5 w-full mt-4">
        <ButtonComponent
          onClick={() => router.push('/balance/topup')}
          color="accent"
          isFilled
          className="w-full h-11 text-[13px]"
        >
          Повторить попытку
        </ButtonComponent>
        <ButtonComponent
          onClick={() => router.push('/profile')}
          color="secondary"
          isFilled
          className="w-full h-11 text-[13px]"
        >
          В личный кабинет
        </ButtonComponent>
      </div>
    </div>
  )
}
