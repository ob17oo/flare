'use client'
import { useGame } from "@/entities/game/hooks/useGames";
import { GameProduct } from "@/entities/game/model/types";
import { Product } from "@/entities/product/model/types";
import { PaymentComponent } from "@/features/Payment";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";

interface GameProps {
    initialGame: Product,
    gameId: string
}

export function GamePage({initialGame, gameId}: GameProps){
    const router = useRouter()
    const initialGameProduct: GameProduct = initialGame as GameProduct
    const { data: game} = useGame(gameId, {
        initialData: initialGameProduct
    })

    if(!game){
        notFound()
    }

    const imagesStack = [
        '1',
        '2',
        '3',
    ]

    return (
        <section className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] rounded-xl cursor-pointer text-[var(--text-primary)] transition-all duration-300" type="button" title="Назад">
                    <ArrowLeft size={18} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-2">
                <div className="flex flex-col gap-6">
                    <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">{game.title}</h1>
                    
                    {/* Gallery section */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
                        <div className="flex md:flex-col gap-3 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
                            {imagesStack.map((image, idx) => (
                                <button key={image} type="button" className={`relative rounded-xl overflow-hidden aspect-[16/9] md:aspect-square w-24 shrink-0 md:w-full border-2 transition-all ${idx === 0 ? 'border-[var(--accent)]' : 'border-[var(--border-muted)] hover:border-[var(--text-secondary)]'} cursor-pointer bg-[var(--secondary)]`}>
                                    <Image fill className="object-cover opacity-60" src={game.image_url} alt={`Preview ${idx + 1}`} sizes="100px" />
                                </button>
                            ))}
                        </div>
                        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl overflow-hidden aspect-[16/10] relative p-3 shadow-[var(--card-shadow)]">
                            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[var(--bg-layer-0)]">
                                <Image className="object-cover" fill src={game.image_url} alt={game.title} priority sizes="(max-width: 768px) 100vw, 800px" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2.5">
                        <span className="text-[12px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-lg bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-primary)]">{game.game?.genre}</span>
                        <span className="text-[12px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-lg bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-primary)]">{game.game?.launcher.title}</span>
                    </div>

                    {/* Description */}
                    <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-3">
                        <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Описание товара</h3>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed text-justify">{game.description}</p>
                    </div>

                    {/* Instructions Accordion */}
                    <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)]">
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
                                    Чтобы активировать, перейдите в лаунчер игры, которую вы купили, перейдите во вкладку активации промокода и вставьте полученный ключ.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="FAQ" className="border-none py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">FAQ</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    Ответы на часто задаваемые вопросы о покупке, возвратах и поддержке. Наша команда работает 24/7 для помощи клиентам.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
                
                <div className="h-fit">
                    <PaymentComponent item={game}/>
                </div>
            </div>
        </section>
    )
}