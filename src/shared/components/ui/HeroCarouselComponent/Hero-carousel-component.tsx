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
                        <CarouselItem key={item.id} className="h-160 basis-full">
                            <div className="h-full w-full rounded-3xl relative overflow-hidden bg-[var(--secondary)] border border-[var(--border-muted)]">
                                <Image className="opacity-45 object-cover" src={item.image_url} fill alt={item.title} priority />
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/80 via-transparent to-transparent" />
                                
                                <div className="absolute inset-y-0 left-12 md:left-24 flex flex-col justify-center max-w-xl z-10">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-3">
                                            <h1 className="font-extrabold text-[36px] md:text-[48px] uppercase tracking-tight text-[var(--text-primary)] leading-tight">{item.title.toUpperCase()}</h1>
                                            {item.description && (
                                                <p className="text-[15px] text-[var(--text-secondary)] text-left leading-relaxed line-clamp-3">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <button 
                                            className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold rounded-xl cursor-pointer w-fit shadow-[var(--card-shadow)] active:scale-95 transition-all duration-300" 
                                            onClick={() => router.push(`/games/${item.id}`)}
                                        >
                                            Подробнее
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-between gap-2 z-10 w-[90%] max-w-xs">
                { Array.from({length: count}).map((_, index) => (
                    <button 
                        onClick={() => api?.scrollTo(index)} 
                        key={index} 
                        className={`h-1 flex-1 rounded-full transition-all duration-300 cursor-pointer ${ index === current ? 'bg-[var(--accent)] scale-x-110' : 'bg-[var(--text-primary)]/20 hover:bg-[var(--text-primary)]/40'} `} 
                        aria-label={`Слайд ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    </div>
  );
}
