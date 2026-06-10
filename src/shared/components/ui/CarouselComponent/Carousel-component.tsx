'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { CardComponent } from "../CardComponent/Card-component"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../shadCN/carousel"
import { TCarouselItem } from "@/entities/product/model/types"
import { SIZE_CONFIG } from "./model/sizeConfig"


type SizeVariant = 'default' | 'medium' | 'large'

interface CarouselProps{
    carouselItem?: TCarouselItem[],
    carouselHeader: string,
    carouselImage: string,
    sizeVariant: SizeVariant,
    carouselValue: string
}

export function CarouselComponent({carouselItem, carouselHeader, carouselImage, sizeVariant = 'default', carouselValue}: CarouselProps){
    const router = useRouter()
    const safeCarouselItem = carouselItem || []
    const limitItem = safeCarouselItem.slice(0,12)

    return ( 
        <Carousel className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)]" opts={{
            align: 'start',
            dragFree: true
        }}>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        {carouselImage && (
                            <div className="flex items-center justify-center w-11 h-11 bg-[var(--bg-layer-3)] border border-[var(--border-muted)] rounded-xl relative overflow-hidden">
                                <Image src={carouselImage} width={22} height={22} alt={carouselHeader} className="object-contain" />
                            </div>
                        )}
                        <h2 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">{carouselHeader}</h2>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <CarouselPrevious />
                        <CarouselNext />
                    </div>
                </div>
                <CarouselContent className="flex gap-2">
                    { (!carouselItem || carouselItem.length === 0) && (
                        <div className="text-accent text-xl pl-4">Произошла ошибка</div>
                    )}
                    { limitItem.map((item) => (
                    
                        <CarouselItem className={`cursor-pointer ${SIZE_CONFIG[sizeVariant].cardBasis}`} key={item.title} 
                        onClick={() => router.push(`${carouselValue === 'wallets' ? `/${carouselValue}?walletId=${item.id}` : `/${carouselValue}/${item.id}`}`)} 
                        >
                           <CardComponent item={item} sizeVariant={sizeVariant} sizeConfig={SIZE_CONFIG}/>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </div>
        </Carousel>
    )
}