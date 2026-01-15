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
    console.log(game)
    return (
        <section className="flex flex-col gap-3">
            <div>
                <button onClick={() => router.back()} className="text-lg flex items-center justify-center bg-accent rounded-full px-3 cursor-pointer" type="button">
                    <ArrowLeft size={18} color="white"/>
                </button>
            </div>
            <h1 className="text-2xl font-bold">{game.title}</h1>
            <div className="grid grid-cols-[calc(70%-12px)_calc(30%-12px)] gap-6">
                <div className="flex flex-col gap-3">
                    <div className="relative rounded-2xl w-full h-112.5 bg-secondary">
                        <Image className="object-contain py-2" src={game.image_url} alt={game.title} fill/>
                    </div>
                    <div className="flex gap-3">
                        <p className="px-3 py-2 rounded-full flex items-center justify-center bg-accent">{game.game?.genre}</p>
                        <p className="px-3 py-2 rounded-full flex items-center justify-center bg-accent">{game.game?.launcher.title}</p>
                    </div>
                    <p className="text-lg">{game.description}</p>
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
                <div className="">
                    <PaymentComponent game={game}/>
                </div>
            </div>
        </section>
    )
}