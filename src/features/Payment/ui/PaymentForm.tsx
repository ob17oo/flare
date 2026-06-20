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

    if(status === 'unauthenticated' || !session?.user.id ){
        return (
            <div className="bg-secondary rounded-2xl p-4 flex flex-col items-center justify-center gap-6 h-40">
                <p className="text-error text-h4">Необходимо авторизироваться</p>
                <button onClick={() => router.push('/login')} className="cursor-pointer px-6 py-3 text-h5 rounded-2xl bg-primary" type="button">Авторизироваться</button>
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