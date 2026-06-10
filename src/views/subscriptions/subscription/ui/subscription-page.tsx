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
        <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] rounded-xl cursor-pointer text-[var(--text-primary)] transition-all duration-300" type="button" title="Назад">
                    <ArrowLeft size={18} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-2">
                <div className="flex flex-col gap-6">
                    <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">{platform.title}</h1>
                    
                    <div className="flex flex-col gap-4 bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-5 shadow-[var(--card-shadow)]">
                        <h4 className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Виды подписок:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
                            {plans.map((plan) => {
                                const isSelected = plan.id === selectedPlan?.id;
                                return (
                                    <button 
                                        onClick={() => setSelectedPlan(plan)} 
                                        type="button" 
                                        key={plan.id} 
                                        className={`group flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 text-left cursor-pointer ${
                                            isSelected 
                                                ? 'bg-[var(--bg-layer-3)] border-[var(--accent)] shadow-[var(--card-shadow)] scale-[1.02]' 
                                                : 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] hover:border-[var(--text-secondary)]'
                                        }`}
                                    >
                                        <div className="relative overflow-hidden rounded-lg w-full aspect-square bg-[var(--bg-layer-0)] border border-[var(--border-muted)]">
                                            <Image className={`object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 ${isSelected ? 'scale-105' : 'scale-100'}`} fill src={plan.image_url} alt={plan.title} sizes="100px" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{plan.servicePlans?.duration} мес | {plan.productEdition}</span>
                                            <h4 className="text-[15px] font-extrabold text-[var(--text-primary)] mt-0.5">{plan.price.toLocaleString('ru-RU')} ₽</h4>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl shadow-[var(--card-shadow)]">
                        <h4 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">Описание сервиса</h4>
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{platform.description}</p>
                    </div>
                    
                    <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl shadow-[var(--card-shadow)]">
                        <Accordion type="single" collapsible className="flex flex-col gap-1">
                            <AccordionItem value="Способ получения" className="border-b border-[var(--border-muted)] py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">Способ получения</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    На ваш аккаунт по почте будет отправлена подписка продолжительностью, которую вы выбрали
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="Как активировать" className="border-b border-[var(--border-muted)] py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">Как активировать</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="FAQ" className="border-none py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">FAQ</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
                
                <div className="h-fit">
                    {selectedPlan && (
                        <PaymentComponent item={selectedPlan}/>
                    )}
                </div>
            </div>
        </div>
    )
}