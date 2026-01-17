'use client'

import { useServicePlansByPlatform } from "@/entities/service/hooks/useServices"
import { ServicePlanProduct, TServicePlatform } from "@/entities/service/model/types"
import { PaymentComponent } from "@/features/Payment"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { notFound, useRouter } from "next/navigation"
import { useState } from "react"

interface SubscriptionPageProps{
    platform: TServicePlatform,
    initialPlans: ServicePlanProduct[]
}
export function SubscriptionPage({platform, initialPlans}: SubscriptionPageProps){
    const [selectedPlan, setSelectedPlan] = useState<ServicePlanProduct | null>(initialPlans[0] || null)
    const router = useRouter()
    const { data: plans} = useServicePlansByPlatform(platform.id, {
        initialData: initialPlans
    })

    if(!plans){
        notFound()
    }
    
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
                            {plans.map((plan) => (
                                <button onClick={() => setSelectedPlan(plan)} type="button" key={plan.id} className={`flex flex-col gap-1 transition-all duration-300 ease-in-out ${plan === selectedPlan ? 'scale-105 opacity-100' : 'opacity-70'}`}>
                                    <div className={`relative overflow-hidden rounded-2xl w-40 h-40 border ${plan === selectedPlan ? 'border-accent' : 'border-transparent'}`}>
                                        <Image className="object-cover" fill src={plan.image_url} alt={plan.title} />
                                    </div>
                                    <div>
                                        <span className="text-sm">{plan.servicePlans?.duration} мес | {plan.productEdition}</span>
                                        <p className="text-lg text-green-400 font-semibold">{plan.price}₽</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-lg ">{platform.description}</p>
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
                    {selectedPlan && (
                        <PaymentComponent item={selectedPlan}/>
                    )}
                </div>
            </div>
        </div>
    )
}