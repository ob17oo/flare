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

interface PaymentComponentProps {
    item: TPaymentItem,
}

export function PaymentComponent({item}: PaymentComponentProps){
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
                <p>Загрузка...</p>
            </div>
        )
    }

    if(status === 'unauthenticated' || !session?.user.id ){
        return (
            <div className="bg-secondary rounded-2xl p-4 flex items-center justify-center h-40">
                <p className="text-error">Необходима авторизация</p>
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
        <div className="bg-secondary rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-4 border-b border-accent">
                <div className="w-15 h-15 rounded-2xl overflow-hidden relative">
                    <Image className="object-cover" fill src={item.image_url} alt={item.title}/>
                </div>
                <h3 className="text-h3">{item.title}</h3>
            </div>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-1">
                    <label className="text-paragraph opacity-50">Аккаунт для получения</label>
                    <InputComponent {...register('email')} type="email" sizeVariant="default" placeholder="Введите email"/>
                    {errors.email && (
                        <p className="text-sm text-error" role="alert">{errors.email.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <button className={`text-paragraph w-fit ${havePromo ? 'opacity-100' : 'opacity-50'}`} onClick={() => setHavePromo(!havePromo)} type="button">Eсть промокод</button>
                    { havePromo && (
                        <div className="flex flex-col gap-1">
                            <InputComponent {...register('promocode')} type="text" sizeVariant="default" placeholder="Введите промокод"/>
                            {errors.promocode && (
                                <p className="text-sm text-error" role="alert">{errors.promocode.message}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-primary rounded-2xl p-4 flex justify-between items-center">
                    <h3 className="text-h3">Итого: </h3>
                    <h3 className="text-h3 text-green-400">{item.price} руб</h3>
                </div>
                <div className="flex justify-between gap-3">
                    <button 
                        className="bg-primary rounded-2xl w-full h-15 text-h5" 
                        type="submit" 
                        disabled={isSubmitting || !canBuy}
                    >
                        {isSubmitting ? 'Обработка...' : `Купить ${item.price} руб`}
                    </button>
                    <button className="bg-primary rounded-2xl w-full h-15 text-h5" type="button">В избранное</button>
                </div>
            </form>
            <div className="">
                { serverError && (
                    <p className="text-error text-paragraph">{serverError}</p>
                ) }
                { !canBuy && (
                    <p className="text-error text-paragraph">Недостаточно средств</p>
                )

                }
            </div>
            <SuccessModal showModal={showModal} setShowModal={setShowModal}/>
        </div>
    )
}