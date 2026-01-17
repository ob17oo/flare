import { useForm } from "react-hook-form"
import { PaymentFormData, paymentSchema } from "../lib/schemas/payment.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { InputComponent } from "@/shared/components"
import { useState } from "react"
import { paymentAction } from "../actions/payment.action"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
    const router = useRouter()

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
    
    if(status === 'loading'){
        return <div>Загрузка...</div>
    }

    if(status === 'unauthenticated' || !session?.user.id ){
        return <div>Необходима авторизация</div>
    }
    const canBuy = session.user.balance >= item.price

    const onSubmit = async (data: PaymentFormData) => {
        try{
            if(!session?.user?.id){
                setServerError('Необходима авторизация')
                return
            }
            
            setServerError('')
            
            const result = await paymentAction({
                productId: item.id,
                servicePlanId: item.productType === 'SERVICE_PLANS' ? item.servicePlans?.id : undefined,
                email: data.email,
                promocode: data.promocode?.trim() || undefined
            })
            
            if(result.success){
                await update()
                reset()
                router.refresh()
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
                <h2 className="text-xl ">{item.title}</h2>
            </div>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-1">
                    <label className="text-sm opacity-50">Аккаунт для получения</label>
                    <InputComponent {...register('email')} type="email" sizeVariant="default" placeholder="Введите email"/>
                    {errors.email && (
                        <p className="text-sm text-error" role="alert">{errors.email.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <button className={`text-sm w-fit ${havePromo ? 'opacity-100' : 'opacity-50'}`} onClick={() => setHavePromo(!havePromo)} type="button">Eсть промокод</button>
                    { havePromo && (
                        <div className="flex flex-col gap-1">
                            <InputComponent {...register('promocode')} type="text" sizeVariant="default" placeholder="Введите промокод"/>
                            {errors.promocode && (
                                <p className="text-sm text-error" role="alert">{errors.promocode.message}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-primary rounded-2xl p-4 flex justify-between">
                    <p className="text-lg">Итого: </p>
                    <p className="text-lg text-green-400">{item.price} руб</p>
                </div>
                <div className="flex justify-between gap-3">
                    <button 
                        className="bg-primary rounded-2xl w-full h-15" 
                        type="submit" 
                        disabled={isSubmitting || !canBuy}
                    >
                        {isSubmitting ? 'Обработка...' : `Купить ${item.price} руб`}
                    </button>
                    <button className="bg-primary rounded-2xl w-full h-15" type="button">В избранное</button>
                </div>
            </form>
            <div className="p-4 border-accent">
                { serverError && (
                    <p className="text-error text-sm">{serverError}</p>
                ) }
                { !canBuy && (
                    <p className="text-error text-sm">Недостаточно средств</p>
                )

                }
            </div>
            <SuccessModal showModal={showModal} setShowModal={setShowModal}/>
        </div>
    )
}