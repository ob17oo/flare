'use client'

import { TServicePlatformWithPlans } from "@/entities/service/model/types"
import { PaymentComponent } from "@/features/Payment"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SubscriptionPageProps{
    initialService: TServicePlatformWithPlans
}
export function SubscriptionPage({initialService}: SubscriptionPageProps){
    const router = useRouter()
    const service = initialService
    console.log(service)
    return (
        <div className="flex flex-col gap-3">
            <div>
                <button onClick={() => router.back()} className="text-lg flex items-center justify-center bg-accent rounded-full px-3 cursor-pointer" type="button">
                    <ArrowLeft size={18} color="white"/>
                </button>
            </div>
            <h1 className="text-2xl font-bold">{}</h1>
            <div className="grid grid-cols-[calc(70%-12px)_calc(30%-12px)] gap-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 bg-secondary rounded-2xl p-3">
                        <h2>Виды подписок:</h2>
                        <div className="grid grid-cols-5 gap-3 w-full">
                            {service.servicePlans.map((plan) => (
                                <div key={plan.id} className="flex flex-col gap-1">
                                    <div className="relative overflow-hidden rounded-2xl w-40 h-40">
                                        <Image className="object-cover" fill src={plan.product.image_url} alt={plan.product.title} />
                                    </div>
                                    <div>
                                        <span className="text-sm">{plan.duration} мес | {plan.product.productEdition}</span>
                                        <p className="text-lg text-green-400 font-semibold">{plan.product.price}₽</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-lg ">{service.description}</p>
                    <div>
                        <Accordion type="single" collapsible className="flex flex-col gap-3">
                            <AccordionItem value="Способ получения">
                                <AccordionTrigger>Способ получения</AccordionTrigger>
                                <AccordionContent>
                                    На ваш аккаунт по почте будет отправлена подписка продолжительностью, которую вы выбрали
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="Как активировать">
                                <AccordionTrigger>Как активировать</AccordionTrigger>
                                <AccordionContent>
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="FAQ">
                                <AccordionTrigger>FAQ</AccordionTrigger>
                                <AccordionContent>
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
                <div>
                    <PaymentComponent game={service}/>
                </div>
            </div>
        </div>
    )
}