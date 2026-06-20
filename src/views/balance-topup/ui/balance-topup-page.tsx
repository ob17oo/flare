'use client'

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { InputComponent, ButtonComponent, ErrorMessage } from "@/shared/components"
import { createStripeSessionAction } from "@/features/Payment/actions/createStripeSession.action"
import { ShieldCheck, Zap, CreditCard, History, Wallet } from "lucide-react"

// DB Deposit type interface
interface DepositInfo {
  id: string
  amount: number
  stripeId: string
  status: 'PENDING' | 'SUCCESS' | 'CANCELLED' | 'PROCESSING' | 'PAID'
  createdAt: Date
}

interface BalanceTopupPageProps {
  initialDeposits: DepositInfo[]
}

const topupSchema = z.object({
  amount: z.number({ message: "Введите корректное число" })
    .min(100, { message: "Минимальная сумма пополнения — 100 ₽" })
    .max(150000, { message: "Максимальная сумма пополнения — 150 000 ₽" })
})

type TopupFormData = z.infer<typeof topupSchema>

export function BalanceTopupPage({ initialDeposits = [] }: BalanceTopupPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TopupFormData>({
    resolver: zodResolver(topupSchema),
    mode: 'onChange',
    defaultValues: {
      amount: 500
    }
  })

  const amountValue = watch('amount') || 0

  const lastSuccessfulDeposit = useMemo(() => {
    return initialDeposits.find(d => d.status === 'SUCCESS')
  }, [initialDeposits])

  const handleQuickAmount = (val: number) => {
    setValue('amount', val, { shouldValidate: true })
  }

  const onSubmit = async (data: TopupFormData) => {
    try {
      setErrorMsg('')
      setIsRedirecting(true)

      const result = await createStripeSessionAction({
        amount: data.amount
      })

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setErrorMsg('Не удалось создать сессию оплаты')
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Произошла ошибка'
      const msg = errMsg.replace('STRIPE_SESSION_ERROR: ', '')
      setErrorMsg(msg)
    } finally {
      setIsRedirecting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-lg text-[var(--text-secondary)]">Загрузка...</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="max-w-[480px] mx-auto py-20 text-center flex flex-col gap-4">
        <h2 className="text-h3 font-bold text-error">Необходима авторизация</h2>
        <p className="text-[14px] text-[var(--text-secondary)]">Пожалуйста, войдите в свой аккаунт, чтобы продолжить.</p>
        <ButtonComponent onClick={() => router.push('/login')} color="accent" isFilled className="mx-auto px-8 py-3 mt-2">
          Войти в аккаунт
        </ButtonComponent>
      </div>
    )
  }

  const { user } = session

  return (
    <div className="max-w-[540px] mx-auto py-10 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
          Пополнение баланса
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Пополняйте личный счет аккаунта Flare через защищенный шлюз Stripe
        </p>
      </div>

      {/* Grid: Balance Card & Stripe Form */}
      <div className="flex flex-col gap-6">
        
        {/* Compact Balance block */}
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-5 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Wallet size={12} />
              Ваш баланс
            </span>
            <p className="text-[24px] font-extrabold text-[var(--text-primary)] leading-tight">
              {user.balance.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          {lastSuccessfulDeposit && (
            <div className="flex flex-col items-end gap-0.5 text-right">
              <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase">Последнее пополнение</span>
              <p className="text-[13px] font-bold text-[var(--success)] leading-tight">
                +{lastSuccessfulDeposit.amount.toLocaleString('ru-RU')} ₽
              </p>
              <span className="text-[10px] text-[var(--text-secondary)]">
                {new Date(lastSuccessfulDeposit.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>

        {/* Topup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--secondary)] border border-[var(--border-muted)] p-6 rounded-2xl shadow-[var(--card-shadow)] flex flex-col gap-5">
          {/* Amount input */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Сумма в рублях (₽)
            </label>
            <div className="relative">
              <InputComponent
                {...register('amount', { valueAsNumber: true })}
                type="number"
                sizeVariant="medium"
                placeholder="Введите сумму"
                min={100}
                max={150000}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)]">
                ₽
              </span>
            </div>
            {errors.amount && (
              <p className="text-xs text-[var(--error)] font-medium" role="alert">{errors.amount.message}</p>
            )}

            {/* Quick amounts */}
            <div className="grid grid-cols-5 gap-1.5 mt-1">
              {[100, 500, 1000, 2500, 5000].map((val) => {
                const isActive = amountValue === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className={`text-[12px] font-semibold py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[var(--accent)] border-transparent text-white'
                        : 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]/30'
                    }`}
                  >
                    {val} ₽
                  </button>
                )
              })}
            </div>
          </div>

          {errorMsg && (
            <ErrorMessage message={errorMsg} />
          )}

          {/* Checkout Button */}
          <button
            type="submit"
            disabled={isRedirecting || amountValue < 100 || amountValue > 150000}
            className={`w-full h-12 flex items-center justify-center rounded-xl font-bold text-[13px] transition-all duration-200 active:scale-[0.99] mt-2 ${
              isRedirecting || amountValue < 100 || amountValue > 150000
                ? 'bg-[var(--bg-layer-3)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-muted)] opacity-60'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer shadow-sm'
            }`}
          >
            {isRedirecting ? 'Перенаправление...' : 'Перейти к оплате'}
          </button>
        </form>

        {/* Minimal info block */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center px-2 py-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[var(--success)] shrink-0" />
            <span>Оплата Stripe Checkout защищена SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[var(--accent)] shrink-0" />
            <span>Моментальное зачисление после оплаты</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-blue-400 shrink-0" />
            <span>Поддерживаются все карты</span>
          </div>
        </div>

        {/* Transaction History flat table */}
        <div className="border-t border-[var(--border-muted)]/60 pt-8 mt-2 flex flex-col gap-4">
          <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
            <History size={16} />
            История операций
          </h3>

          {initialDeposits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border-muted)]/60 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                    <th className="py-2.5">Дата</th>
                    <th className="py-2.5 hidden sm:table-cell">ID Сессии</th>
                    <th className="py-2.5">Сумма</th>
                    <th className="py-2.5 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]/40 text-[12px]">
                  {initialDeposits.map((dep) => (
                    <tr key={dep.id} className="text-[var(--text-primary)]">
                      <td className="py-3 font-medium">
                        {new Date(dep.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[var(--text-secondary)] max-w-[120px] truncate hidden sm:table-cell" title={dep.stripeId}>
                        {dep.stripeId}
                      </td>
                      <td className="py-3 font-bold">
                        +{dep.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          dep.status === 'SUCCESS' || dep.status === 'PAID'
                            ? 'bg-green-500/5 text-[var(--success)] border-green-500/10'
                            : dep.status === 'PENDING'
                            ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10'
                            : 'bg-red-500/5 text-[var(--error)] border-red-500/10'
                        }`}>
                          {dep.status === 'SUCCESS' || dep.status === 'PAID' ? 'Выполнено' : dep.status === 'PENDING' ? 'Ожидание' : 'Отменено'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center border border-dashed border-[var(--border-muted)] rounded-xl flex flex-col gap-1 items-center justify-center">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">История пуста</span>
              <span className="text-[11px] text-[var(--text-secondary)]">Здесь будут отображаться ваши пополнения счета</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
