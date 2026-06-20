'use client'

import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { InputComponent, Accordion, AccordionContent, AccordionItem, AccordionTrigger, ErrorMessage } from "@/shared/components"
import { steamPaymentAction } from "@/features/Payment/actions/steamPayment.action"
import { SuccessModal } from "@/features/Payment/ui/SuccessModal"

// Schema validation
const steamTopupSchema = z.object({
  steamLogin: z.string()
    .min(3, { message: "Логин должен быть не менее 3 символов" })
    .max(32, { message: "Логин слишком длинный" })
    .regex(/^[a-zA-Z0-9_\-\.]+$/, { message: "Логин содержит недопустимые символы" }),
  amount: z.number({ message: "Введите корректное число" })
    .min(100, { message: "Минимальная сумма — 100 ₽" })
    .max(50000, { message: "Максимальная сумма — 50 000 ₽" }),
  promocode: z.string().optional()
})

type SteamTopupFormData = z.infer<typeof steamTopupSchema>

export function SteamTopupPage() {
  const searchParams = useSearchParams()
  const promoParam = searchParams ? searchParams.get('promo') : null
  const { data: session, status, update } = useSession()
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card' | 'sbp' | 'qiwi'>('card')
  const [havePromo, setHavePromo] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  // Fetch user's referral discount
  const { data: referralData } = useQuery({
    queryKey: ['user-referrals'],
    queryFn: async () => {
      const res = await fetch('/api/profile/referrals')
      if (!res.ok) return null
      return res.json()
    },
    enabled: status === 'authenticated'
  })

  const referralDiscount = referralData?.discount || 0

  const validatePromo = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/promocodes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: (data) => {
      setPromoDiscount(data.discount)
      setPromoError('')
    },
    onError: (error: Error) => {
      setPromoDiscount(0)
      setPromoError(error.message)
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SteamTopupFormData>({
    resolver: zodResolver(steamTopupSchema),
    mode: 'onChange',
    defaultValues: {
      steamLogin: '',
      amount: 1000,
      promocode: ''
    }
  })

  const { mutate: validatePromoMutate } = validatePromo

  useEffect(() => {
    if (promoParam && !promoApplied) {
      setHavePromo(true)
      setValue('promocode', promoParam)
      
      validatePromoMutate(promoParam, {
        onSuccess: (data) => {
          setPromoMessage(`Промокод "${promoParam}" успешно применен! Скидка: ${data.discount}%`)
          setPromoDiscount(data.discount)
          setPromoError('')
          setPromoApplied(true)
        },
        onError: (err) => {
          setPromoMessage(`Ошибка промокода "${promoParam}": ${err.message}`)
          setPromoDiscount(0)
          setPromoError(err.message)
          setPromoApplied(true)
        }
      })
    }
  }, [promoParam, promoApplied, setValue, validatePromoMutate])

  const amountValue = watch('amount') || 0
  const promocodeValue = watch('promocode')

  // Debounced promo validation
  useEffect(() => {
    // If the promo code from parameters is already validated, skip duplicate checks
    if (promoParam && promoApplied && promocodeValue === promoParam) {
      return
    }

    if (!havePromo || !promocodeValue || promocodeValue.length < 3) {
      // Guard against infinite update loops by updating state only when different
      setPromoDiscount((prev) => (prev !== 0 ? 0 : prev))
      setPromoError((prev) => (prev !== '' ? '' : prev))
      return
    }

    const timer = setTimeout(() => {
      validatePromoMutate(promocodeValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [promocodeValue, havePromo, promoParam, promoApplied, validatePromoMutate])

  // 8% service commission
  const commissionFee = useMemo(() => {
    return Math.round(amountValue * 0.08)
  }, [amountValue])

  // Base price with commission
  const basePriceWithCommission = useMemo(() => {
    return amountValue + commissionFee
  }, [amountValue, commissionFee])

  // Total discount (capped at 100%)
  const totalDiscountPercent = useMemo(() => {
    return Math.min(referralDiscount + promoDiscount, 100)
  }, [referralDiscount, promoDiscount])

  // Final calculated price
  const calculatedPrice = useMemo(() => {
    const discountAmount = Math.round(amountValue * totalDiscountPercent / 100)
    return Math.max(basePriceWithCommission - discountAmount, 0)
  }, [amountValue, basePriceWithCommission, totalDiscountPercent])

  const discountValueInRub = basePriceWithCommission - calculatedPrice

  const canBuy = useMemo(() => {
    if (paymentMethod === 'balance') {
      return session ? session.user.balance >= calculatedPrice : false
    }
    return true
  }, [paymentMethod, session, calculatedPrice])

  const handleQuickAmount = (val: number) => {
    setValue('amount', val, { shouldValidate: true })
  }

  const onSubmit = async (data: SteamTopupFormData) => {
    try {
      setServerError('')
      
      if (paymentMethod === 'balance' && (!session?.user?.id)) {
        setServerError('Необходима авторизация')
        return
      }

      const result = await steamPaymentAction({
        steamLogin: data.steamLogin,
        amount: data.amount,
        calculatedPrice: calculatedPrice,
        promocode: data.promocode?.trim() || undefined,
        paymentMethod: paymentMethod
      })

      if (result.success) {
        try {
          await update()
        } catch (err) {
          console.error('Session update error:', err)
        }
        setSuccessMsg(result.message)
        setShowModal(true)
      } else {
        setServerError(result.message)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        const msg = error.message.replace('TOPUP ERROR ', '')
        setServerError(msg)
      } else {
        setServerError('Произошла ошибка при проведении платежа')
      }
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 py-12 flex flex-col gap-10">
      {/* Centered Minimal Header */}
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
          Пополнение Steam
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Средства поступят на кошелек Steam в течение нескольких минут
        </p>
      </div>

      {/* Main Form Block */}
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Steam Login Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Логин Steam
          </label>
          <InputComponent
            {...register('steamLogin')}
            type="text"
            sizeVariant="default"
            placeholder="Введите логин аккаунта (не никнейм)"
          />
          {errors.steamLogin ? (
            <p className="text-xs text-[var(--error)] font-medium" role="alert">{errors.steamLogin.message}</p>
          ) : (
            <span className="text-[11px] text-[var(--text-secondary)] leading-normal">
              Логин используется для входа в Steam. Не вводите никнейм.
            </span>
          )}
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Сумма пополнения
          </label>
          <div className="relative">
            <InputComponent
              {...register('amount', { valueAsNumber: true })}
              type="number"
              sizeVariant="default"
              placeholder="Сумма"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--text-secondary)]">
              ₽
            </span>
          </div>
          {errors.amount && (
            <p className="text-xs text-[var(--error)] font-medium" role="alert">{errors.amount.message}</p>
          )}

          {/* Low-profile quick select control */}
          <div className="grid grid-cols-5 gap-1.5 mt-1">
            {[250, 500, 1000, 2500, 5000].map((val) => {
              const isActive = amountValue === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className={`text-[12px] font-semibold py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent)] border-transparent text-white'
                      : 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]/30'
                  }`}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>

        {/* Minimal horizontal segmented tabs for Payment Method */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Способ оплаты
          </label>
          <div className="grid grid-cols-4 bg-[var(--bg-layer-2)] p-1 rounded-xl border border-[var(--border-muted)] gap-1">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`text-[12px] font-semibold py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                paymentMethod === 'card'
                  ? 'bg-[var(--secondary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Карта РФ
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('sbp')}
              className={`text-[12px] font-semibold py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                paymentMethod === 'sbp'
                  ? 'bg-[var(--secondary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              СБП
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('qiwi')}
              className={`text-[12px] font-semibold py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                paymentMethod === 'qiwi'
                  ? 'bg-[var(--secondary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              QIWI
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('balance')}
              className={`text-[12px] font-semibold py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                paymentMethod === 'balance'
                  ? 'bg-[var(--secondary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Баланс
            </button>
          </div>
          
          {/* Status info for balance payment */}
          {paymentMethod === 'balance' && (
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 text-center leading-normal">
              {status === 'authenticated' && session
                ? `Баланс аккаунта Flare: ${session.user.balance.toLocaleString('ru-RU')} ₽`
                : 'Для оплаты с баланса необходимо войти в аккаунт'}
            </span>
          )}
        </div>

        {/* Promocode toggle */}
        <div className="flex flex-col gap-1">
          <button 
            type="button"
            onClick={() => setHavePromo(!havePromo)}
            className="text-[12px] font-semibold text-[var(--accent)] hover:underline cursor-pointer w-fit"
          >
            {havePromo ? 'Убрать промокод' : 'Есть промокод?'}
          </button>
          {havePromo && (
            <div className="flex flex-col gap-1">
              {promoMessage && (
                <div className={`text-[12px] p-2.5 rounded-lg border font-medium leading-relaxed mb-1 max-w-xs ${
                  promoMessage.includes('успешно')
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {promoMessage}
                </div>
              )}
              <InputComponent
                {...register('promocode')}
                type="text"
                sizeVariant="default"
                placeholder="Введите промокод"
                className="max-w-xs mt-1 uppercase"
              />
              {promoError && !promoMessage && <span className="text-[11px] text-[var(--error)] font-medium mt-1">{promoError}</span>}
              {promoDiscount > 0 && !promoMessage && <span className="text-[11px] text-[var(--success)] font-medium mt-1">Промокод применен: -{promoDiscount}%</span>}
            </div>
          )}
        </div>

        {/* Minimal Order Details Summary */}
        <div className="border-t border-[var(--border-muted)] pt-4 mt-2 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[12px] text-[var(--text-secondary)]">
            <span>Сумма пополнения</span>
            <span>{amountValue} ₽</span>
          </div>
          <div className="flex justify-between items-center text-[12px] text-[var(--text-secondary)]">
            <span>Комиссия за перевод (8%)</span>
            <span>{commissionFee} ₽</span>
          </div>
          
          {(referralDiscount > 0 || promoDiscount > 0) && (
            <div className="flex justify-between items-center text-[12px] text-[var(--success)] font-medium">
              <span>Скидка ({totalDiscountPercent}%)</span>
              <span>-{discountValueInRub} ₽</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[14px] font-semibold text-[var(--text-primary)] mt-1">
            <span>Итого к оплате</span>
            <span>{calculatedPrice} ₽</span>
          </div>
        </div>

        {serverError && (
          <ErrorMessage message={serverError} />
        )}

        {/* CTA pay button */}
        <button
          type="submit"
          disabled={isSubmitting || !canBuy || (paymentMethod === 'balance' && status !== 'authenticated')}
          className={`w-full h-11 flex items-center justify-center rounded-xl font-bold text-[13px] transition-all duration-200 active:scale-[0.99] ${
            isSubmitting || !canBuy || (paymentMethod === 'balance' && status !== 'authenticated')
              ? 'bg-[var(--bg-layer-3)] text-[var(--text-secondary)] cursor-not-allowed opacity-60 border border-[var(--border-muted)]'
              : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer shadow-sm'
          }`}
        >
          {isSubmitting ? 'Обработка...' : `Оплатить ${calculatedPrice.toLocaleString('ru-RU')} ₽`}
        </button>
      </form>

      {/* Flat low-profile FAQ block without outer card container */}
      <div className="border-t border-[var(--border-muted)] pt-8 mt-4 flex flex-col gap-4">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
          Ответы на вопросы
        </h3>
        <Accordion type="single" collapsible className="flex flex-col gap-1 w-full">
          <AccordionItem value="faq-1" className="border-b border-[var(--border-muted)]/60 py-0.5">
            <AccordionTrigger className="text-[13px] font-medium text-[var(--text-primary)] hover:no-underline py-2.5">
              В какие регионы зачисляются средства?
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[var(--text-secondary)] leading-relaxed pb-3">
              Услуга доступна для аккаунтов России, СНГ, Турции и других стран. Конвертация валют производится автоматически по текущему внутреннему курсу Steam.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border-b border-[var(--border-muted)]/60 py-0.5">
            <AccordionTrigger className="text-[13px] font-medium text-[var(--text-primary)] hover:no-underline py-2.5">
              Какая комиссия сервиса?
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[var(--text-secondary)] leading-relaxed pb-3">
              Комиссия Flare составляет 8%. Это окончательная наценка, которая покрывает расходы платежного шлюза и конвертацию.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border-none py-0.5">
            <AccordionTrigger className="text-[13px] font-medium text-[var(--text-primary)] hover:no-underline py-2.5">
              Что делать, если допущена ошибка в логине?
            </AccordionTrigger>
            <AccordionContent className="text-[12px] text-[var(--text-secondary)] leading-relaxed pb-3">
              Если аккаунта с таким логином не существует, средства вернутся на баланс вашего профиля. В случае зачисления на чужой существующий логин вернуть средства невозможно, поэтому просим проверять правильность ввода логина перед оплатой.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <SuccessModal showModal={showModal} setShowModal={setShowModal} successMsg={successMsg} />
    </div>
  )
}
