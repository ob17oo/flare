'use client'
import { useForm } from "react-hook-form"
import { PaymentFormData, paymentSchema } from "../lib/schemas/payment.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { InputComponent } from "@/shared/components"
import { useState } from "react"
import { paymentAction } from "../actions/payment.action"
import { useSession } from "next-auth/react"
import { SuccessModal } from "./SuccessModal"
import { TPaymentItem } from "../model/types"
import { useRouter } from "next/navigation"

interface PaymentComponentProps {
    item: TPaymentItem,
}

export function PaymentComponent({item}: PaymentComponentProps){
    const router = useRouter()
    const [havePromo, setHavePromo] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [serverError, setServerError] = useState('')
    const { data: session, status, update } = useSession()
    
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            promocode: ''
        }
    })

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
    const canBuy = item && session.user.balance >= item.price

    const onSubmit = async (data: PaymentFormData) => {
        try{
            if(!session?.user?.id){
                setServerError('Необходима авторизация')
                return
            }
            
            setServerError('')
            
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
                
                <div className="flex flex-col gap-1.5">
                    <button 
                        className="text-[13px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors hover:underline cursor-pointer w-fit text-left" 
                        onClick={() => setHavePromo(!havePromo)} 
                        type="button"
                    >
                        {havePromo ? 'Убрать промокод' : 'У меня есть промокод'}
                    </button>
                    { havePromo && (
                        <div className="flex flex-col gap-1.5 mt-1">
                            <InputComponent {...register('promocode')} type="text" sizeVariant="default" placeholder="Введите промокод"/>
                            {errors.promocode && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5" role="alert">{errors.promocode.message}</p>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl p-4 flex justify-between items-center mt-2">
                    <span className="text-[14px] font-semibold text-[var(--text-secondary)]">Итого к оплате:</span>
                    <span className="text-[18px] font-extrabold text-[var(--text-primary)]">{item.price.toLocaleString('ru-RU')} ₽</span>
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
                        {isSubmitting ? 'Обработка...' : `Оплатить заказ`}
                    </button>
                    <button 
                        className="w-full h-12 flex items-center justify-center rounded-xl bg-transparent border border-[var(--border-muted)] hover:bg-[var(--bg-layer-3)] text-[var(--text-primary)] font-semibold text-[14px] cursor-pointer transition-colors duration-300" 
                        type="button"
                    >
                        В избранное
                    </button>
                </div>
            </form>
            
            <div className="mt-1">
                { serverError && (
                    <p className="text-xs text-[var(--error)] font-semibold text-center" role="alert">{serverError}</p>
                ) }
                { !canBuy && (
                    <p className="text-xs text-[var(--error)] font-semibold text-center" role="alert">Недостаточно средств на балансе</p>
                ) }
            </div>
            <SuccessModal showModal={showModal} setShowModal={setShowModal}/>
        </div>
    )
}