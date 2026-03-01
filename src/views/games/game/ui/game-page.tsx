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
        <section className="flex flex-col gap-3">
            <div>
                <button onClick={() => router.back()} className="text-lg flex items-center justify-center bg-accent rounded-full px-3 cursor-pointer" type="button">
                    <ArrowLeft size={18} color="white"/>
                </button>
            </div>
            <h1 className="text-h2 font-bold">{game.title}</h1>
            <div className="grid grid-cols-[calc(70%-12px)_calc(30%-12px)] gap-6">
                <div className="flex flex-col gap-3">
                    <div className="w-full h-150 grid grid-cols-[calc(20%-12px)_calc(80%-12px)] justify-between">
                        <div className="rounded-2xl w-full h-full flex flex-col gap-3">
                            {imagesStack.map((image) => (
                                <div key={image} className="rounded-2xl w-full h-full overflow-hidden">
                                    <div className="bg-accent w-full h-full flex justify-center items-center">
                                        <p className="text-white">
                                            {image}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-secondary rounded-2xl w-full h-full p-3">
                            <div className="relative overflow-hidden rounded-2xl w-full h-full">
                                <Image className="object-contain" fill src={game.image_url} alt={game.title}/>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <p className="text-h5 px-3 py-2 rounded-full flex items-center justify-center bg-accent">{game.game?.genre}</p>
                        <p className="text-h5 px-3 py-2 rounded-full flex items-center justify-center bg-accent">{game.game?.launcher.title}</p>
                    </div>
                    <p className="text-h5">{game.description}</p>
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
                    <PaymentComponent item={game}/>
                </div>
            </div>
        </section>
    )
}