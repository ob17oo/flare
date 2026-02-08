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
        <Carousel className="bg-secondary rounded-2xl p-6" opts={{
            align: 'start',
            dragFree: true
        }}>
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 bg-accent rounded-full">
                            <Image src={carouselImage} width={28} height={28} alt={carouselHeader}/>
                        </div>
                        <h2 className="text-h3 ">{carouselHeader}</h2>
                    </div>
                    <div className="flex items-center gap-3 relative">
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