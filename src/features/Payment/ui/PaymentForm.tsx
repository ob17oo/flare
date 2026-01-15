import { Product } from "@/shared/types/product.types"
import { useForm } from "react-hook-form"
import { PaymentFormData, paymentSchema } from "../lib/schemas/payment.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { InputComponent } from "@/shared/components"
import { useState } from "react"

interface PaymentComponentProps {
    game: Product
}
export function PaymentComponent({game}: PaymentComponentProps){
    const [havePromo, setHavePromo] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { isValid, errors, isSubmitting, isSubmitSuccessful }
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            promocode: ''
        }
    })

    const onSubmit = async (data: PaymentFormData) => {
        try{

        } catch(error: unknown){
            if(error instanceof Error){

            }
        }
    }
    return ( 
        <div className="bg-secondary rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-4 border-b-1 border-accent">
                <div className="w-15 h-15 rounded-2xl overflow-hidden relative">
                    <Image className="object-cover" fill src={game.image_url} alt={game.title}/>
                </div>
                <h2 className="text-xl ">{game.title}</h2>
            </div>
            <form className="flex flex-col gap-3" action="">
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
                    <p className="text-lg text-green-400">{game.price} руб</p>
                </div>
                <div className="flex justify-between gap-3">
                    <button className="bg-primary rounded-2xl w-full h-15" type="submit">Купить {game.price} руб</button>
                    <button className="bg-primary rounded-2xl w-full h-15" type="button">В избранное</button>
                </div>
            </form>
        </div>
    )
}