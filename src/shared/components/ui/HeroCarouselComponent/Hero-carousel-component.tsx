"use client";
import { TBaseProduct } from "@/entities/product/model/types";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/shadCN/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface CarouselComponenentProps {
  carouselItem?: TBaseProduct[];
}

export function HeroCarouselComponent({
  carouselItem,
}: CarouselComponenentProps) {
    const router = useRouter()
    const safeCarouselItem = carouselItem || []
    const limitedItems = safeCarouselItem.slice(0,6)

    const [api, setApi] = useState<CarouselApi>()
    const [current , setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if(!api) return

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap())
        })

    },[api])

  return (
        <div>
            { (!limitedItems || limitedItems.length === 0) && (
                    <div className="text-accent text-xl">Произошла ошибка</div>
            )}
        <div className="relative">
            <Carousel setApi={setApi} className="w-full"
                plugins={[
                    Autoplay({
                        delay: 3000,
                    })
                ]}
                >
                <CarouselContent>
                    {limitedItems.map((item) => (
                        <CarouselItem key={item.id} className="h-200 basis-full">
                            <div className="h-full w-full rounded-3xl relative overflow-hidden">
                                <Image className="opacity-60 object-cover" src={item.image_url} fill alt={item.title}/>
                                <div className="absolute top-[50%] translate-y-[-50%] left-30">
                                    <div className="flex flex-col gap-8">
                                        <div className="flex flex-col gap-4">
                                            <h1 className="font-bold text-h1">{item.title.toUpperCase()}</h1>
                                            <p className="text-h4 text-justify w-[50%]">{item.description}</p>
                                        </div>
                                        <button className="text-h4 px-4 py-2 border-2 border-accent w-fit" onClick={() => router.push(`/games/${item.id}`)}>Подробнее</button>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-between gap-3 z-10  w-[90%]">
                { Array.from({length: count}).map((_, index) => (
                    <button onClick={() => api?.scrollTo(index)} key={index} className={`w-full h-1 rounded-full transition-all ${ index === current ? 'bg-accent scale-105' : 'bg-white/50 hover:bg-white/80'} `} aria-label={`Слайд ${index + 1}`}/>
                ))}
            </div>
        </div>
    </div>
  );
}
