'use client'
import { useForm } from "react-hook-form"
import { PaymentFormData, paymentSchema } from "../lib/schemas/payment.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { InputComponent, ErrorMessage } from "@/shared/components"
import { useState } from "react"
import { paymentAction } from "../actions/payment.action"
import { createProductStripeSessionAction } from "../actions/createProductStripeSession.action"
import { useSession } from "next-auth/react"
import { SuccessModal } from "./SuccessModal"
import { TPaymentItem } from "../model/types"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

interface PaymentComponentProps {
    item: TPaymentItem,
}

export function PaymentComponent({item}: PaymentComponentProps){
    const router = useRouter()
    const searchParams = useSearchParams()
    const promoParam = searchParams ? searchParams.get('promo') : null
    const [havePromo, setHavePromo] = useState(!!promoParam)
    const [showModal, setShowModal] = useState(false)
    const [serverError, setServerError] = useState('')
    const [promoMessage, setPromoMessage] = useState('')
    const [promoApplied, setPromoApplied] = useState(false)
    const [promoDiscount, setPromoDiscount] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState<'balance' | 'stripe'>('balance')
    const { data: session, status, update } = useSession()

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
    
    const {
        reset,
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isSubmitting }
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            promocode: promoParam || ''
        }
    })

    useEffect(() => {
        if (promoParam && !promoApplied) {
            fetch('/api/promocodes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoParam })
            })
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (ok) {
                    setPromoMessage(`Промокод "${promoParam.toUpperCase()}" успешно применен! Скидка: ${data.discount}%`);
                    setPromoDiscount(data.discount);
                } else {
                    setPromoMessage(`Ошибка промокода "${promoParam.toUpperCase()}": ${data.error}`);
                    setPromoDiscount(0);
                }
                setPromoApplied(true);
            })
            .catch(err => {
                console.error("Promocode auto-apply error:", err);
                setPromoApplied(true);
            });
        }
    }, [promoParam, promoApplied, setValue]);

    const handleApplyPromo = async () => {
        const code = getValues('promocode')?.trim();
        if (!code) {
            setPromoMessage('Введите промокод');
            setPromoDiscount(0);
            return;
        }

        try {
            setPromoMessage('Проверка...');
            const res = await fetch('/api/promocodes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (!res.ok) {
                setPromoMessage(`Ошибка: ${data.error || 'Промокод не найден'}`);
                setPromoDiscount(0);
            } else {
                setPromoMessage(`Промокод "${code.toUpperCase()}" успешно применен! Скидка: ${data.discount}%`);
                setPromoDiscount(data.discount);
            }
        } catch {
            setPromoMessage('Ошибка при проверке промокода');
            setPromoDiscount(0);
        }
    };

    if(!item){
        return (
           <div className="bg-secondary rounded-2xl p-4 flex items-center justify-center h-40">
                <p className="text-error">Товар недоступен</p>
            </div> 
        )
    }
    
    if(status === 'loading'){
        return (
            <div className="bg-secondary rounded-2xl p-4 flex items-center justify-center h-40">
                <p className="text-lg">Загрузка...</p>
            </div>
        )
    }

    if (status === 'unauthenticated' || !session?.user.id) {
        return ( 
            <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-6 relative overflow-hidden">
                {/* Decorative glow background */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl pointer-events-none" />

                {/* Product details header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--border-muted)]">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-[var(--border-muted)] bg-[var(--bg-layer-0)] shrink-0">
                        {item.image_url ? (
                            <Image className="object-cover" fill src={item.image_url} alt={item.title}/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-layer-2)]">
                                <span className="text-[10px] text-[var(--text-secondary)]">No Image</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-[15px] font-bold text-[var(--text-primary)] leading-tight truncate">{item.title}</h3>
                        <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">Цифровая активация</span>
                    </div>
                </div>

                {/* Benefits / Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[var(--bg-layer-2)]/40 border border-[var(--border-muted)]/50 rounded-xl p-3 flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] mt-0.5 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[12px] font-bold text-[var(--text-primary)]">Мгновенная выдача</span>
                            <span className="text-[10px] text-[var(--text-secondary)] leading-tight">Ключ сразу после оплаты</span>
                        </div>
                    </div>
                    <div className="bg-[var(--bg-layer-2)]/40 border border-[var(--border-muted)]/50 rounded-xl p-3 flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] mt-0.5 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[12px] font-bold text-[var(--text-primary)]">Безопасность</span>
                            <span className="text-[10px] text-[var(--text-secondary)] leading-tight">Stripe, СБП и карты</span>
                        </div>
                    </div>
                </div>

                {/* Locked price / discount sneak-peek */}
                <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)]/60 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Цена товара</span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[20px] font-extrabold text-[var(--text-primary)]">{item.price.toLocaleString('ru-RU')} ₽</span>
                            <span className="text-[10px] text-[var(--success)] font-bold bg-green-500/10 px-1.5 py-0.5 rounded shrink-0">-10% с промокодом</span>
                        </div>
                    </div>
                    <div className="opacity-40 select-none shrink-0">
                        <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                {/* Login / Auth CTA block */}
                <div className="border-t border-[var(--border-muted)] pt-5 flex flex-col gap-4">
                    <div className="text-center flex flex-col gap-1.5">
                        <span className="text-[14px] font-bold text-[var(--text-primary)]">Требуется авторизация</span>
                        <p className="text-[11px] text-[var(--text-secondary)] max-w-sm mx-auto leading-normal">
                            Пожалуйста, войдите или зарегистрируйтесь, чтобы завершить покупку, использовать промокоды и отслеживать заказы в личном кабинете.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <button
                            onClick={() => router.push('/login')}
                            className="h-11 flex items-center justify-center rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-bold cursor-pointer transition-colors duration-300 shadow-[var(--card-shadow)] active:scale-[0.98]"
                            type="button"
                        >
                            Войти
                        </button>
                        <button
                            onClick={() => router.push('/register')}
                            className="h-11 flex items-center justify-center rounded-xl bg-transparent border border-[var(--border-muted)] hover:bg-[var(--bg-layer-3)] text-[var(--text-primary)] text-[13px] font-bold cursor-pointer transition-colors duration-300 active:scale-[0.98]"
                            type="button"
                        >
                            Регистрация
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const referralDiscount = referralData?.discount || 0
    const totalDiscountPercent = Math.min(referralDiscount + promoDiscount, 100)
    const discountAmount = Math.round(item.price * totalDiscountPercent / 100)
    const calculatedPrice = Math.max(item.price - discountAmount, 0)
    const canBuy = item && (paymentMethod === 'stripe' || session.user.balance >= calculatedPrice)

    const onSubmit = async (data: PaymentFormData) => {
        try{
            if(!session?.user?.id){
                setServerError('Необходима авторизация')
                return
            }
            
            setServerError('')
            
            if (paymentMethod === 'stripe') {
                const result = await createProductStripeSessionAction({
                    productId: item.id,
                    email: data.email,
                    promocode: data.promocode?.trim() || undefined
                })
                
                if(result.success && result.url){
                    window.location.href = result.url
                } else {
                    setServerError('Не удалось запустить оплату Stripe')
                }
            } else {
                const result = await paymentAction({
                    productId: item.id,
                    email: data.email,
                    promocode: data.promocode?.trim() || undefined
                })
                
                if(result.success){
                    try {
                        await update()
                    } catch(error: unknown){
                        console.error(`Session update failed: ${error}`)
                    }
                    reset()
                    setShowModal(true)
                } else {
                    setServerError(result.message)
                }
            }
        } catch(error: unknown){
            if(process.env.NODE_ENV === 'development'){
                console.error('Payment form error:', error)
            }
            if(error instanceof Error){
                setServerError(error.message)
            } else {
                setServerError('Произошла неизвестная ошибка')
            }
        }
    }

    
    return ( 
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--border-muted)]">
                <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-[var(--border-muted)] bg-[var(--bg-layer-0)] shrink-0">
                    <Image className="object-cover" fill src={item.image_url} alt={item.title}/>
                </div>
                <h3 className="text-[16px] font-bold text-[var(--text-primary)] leading-tight">{item.title}</h3>
            </div>
            
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Аккаунт для получения</label>
                    <InputComponent {...register('email')} type="email" sizeVariant="default" placeholder="Введите email"/>
                    {errors.email && (
                        <p className="text-xs text-[var(--error)] font-medium mt-0.5" role="alert">{errors.email.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Способ оплаты</label>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('balance')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                paymentMethod === 'balance'
                                    ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                                    : 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'
                            }`}
                        >
                            <span className="text-[13px] font-bold">Баланс аккаунта</span>
                            <span className="text-[11px] opacity-80 mt-0.5">{session?.user?.balance?.toLocaleString('ru-RU')} ₽</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('stripe')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                paymentMethod === 'stripe'
                                    ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                                    : 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/30'
                            }`}
                        >
                            <span className="text-[13px] font-bold">Карта / Stripe</span>
                            <span className="text-[11px] opacity-80 mt-0.5">Stripe Checkout</span>
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <button 
                        className="text-[13px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors hover:underline cursor-pointer w-fit text-left" 
                        onClick={() => {
                            setHavePromo(!havePromo)
                            setPromoDiscount(0)
                            setPromoMessage('')
                            setValue('promocode', '')
                        }} 
                        type="button"
                    >
                        {havePromo ? 'Убрать промокод' : 'У меня есть промокод'}
                    </button>
                    { havePromo && (
                        <div className="flex flex-col gap-1.5 mt-1">
                            {promoMessage && (
                                <div className={`text-[12px] p-2.5 rounded-lg border font-medium leading-relaxed mb-1 ${
                                    promoMessage.includes('успешно')
                                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                    {promoMessage}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <InputComponent {...register('promocode')} type="text" sizeVariant="default" placeholder="Введите промокод" className="flex-1 uppercase"/>
                                <button
                                    type="button"
                                    onClick={handleApplyPromo}
                                    className="px-4 h-11 bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]/30 hover:bg-[var(--bg-layer-4)] text-[13px] font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                                >
                                    Применить
                                </button>
                            </div>
                            {errors.promocode && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5" role="alert">{errors.promocode.message}</p>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="border-t border-[var(--border-muted)] pt-4 mt-2 flex flex-col gap-2">
                    {(referralDiscount > 0 || promoDiscount > 0) && (
                        <div className="flex justify-between items-center text-[12px] text-[var(--text-secondary)]">
                            <span>Начальная цена</span>
                            <span className="line-through">{item.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    )}
                    {(referralDiscount > 0 || promoDiscount > 0) && (
                        <div className="flex justify-between items-center text-[12px] text-[var(--success)] font-medium">
                            <span>Скидка ({totalDiscountPercent}%)</span>
                            <span>-{discountAmount.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[14px] font-semibold text-[var(--text-primary)] mt-1">
                        <span>Итого к оплате</span>
                        <span className="text-[18px] font-extrabold text-[var(--text-primary)]">{calculatedPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2.5 mt-2">
                    <button 
                        className={`w-full h-12 flex items-center justify-center rounded-xl font-bold text-[14px] transition-all duration-300 shadow-[var(--card-shadow)] active:scale-[0.98] ${
                            isSubmitting || !canBuy 
                                ? 'bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-secondary)] cursor-not-allowed opacity-60' 
                                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer'
                        }`} 
                        type="submit" 
                        disabled={isSubmitting || !canBuy}
                    >
                        {isSubmitting ? 'Обработка...' : paymentMethod === 'stripe' ? `Оплатить картой ${calculatedPrice.toLocaleString('ru-RU')} ₽` : `Оплатить с баланса ${calculatedPrice.toLocaleString('ru-RU')} ₽`}
                    </button>
                    <button 
                        className="w-full h-12 flex items-center justify-center rounded-xl bg-transparent border border-[var(--border-muted)] hover:bg-[var(--bg-layer-3)] text-[var(--text-primary)] font-semibold text-[14px] cursor-pointer transition-colors duration-300" 
                        type="button"
                    >
                        В избранное
                    </button>
                </div>
            </form>
            
            <div className="mt-1 flex flex-col gap-2">
                { serverError && (
                    <ErrorMessage message={serverError} />
                ) }
                { !canBuy && paymentMethod === 'balance' && (
                    <ErrorMessage message="Недостаточно средств на балансе" />
                ) }
            </div>
            <SuccessModal showModal={showModal} setShowModal={setShowModal}/>
        </div>
    )
}