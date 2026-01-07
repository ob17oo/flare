'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ProductsTypes } from "@/shared/types/product.types"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CardComponent } from "./CardComponent"

type SizeVariant = 'default' | 'medium' | 'large'

interface CarouselProps{
    carouselItem: ProductsTypes[],
    carouselHeader: string,
    carouselImage?: string,
    sizeVariant: SizeVariant
}

export function CarouselComponent({carouselItem, carouselHeader, carouselImage, sizeVariant = 'default'}: CarouselProps){
    const router = useRouter()
    const limitItem = carouselItem.slice(0,12)
    const sizeConfig = {
        default: {
            height: 'h-76',
            cardBasis: 'basis-1/7'

        },
        medium: {
            height: 'h-76',
            cardBasis: 'basis-1/4'
        },
        large: {
            height: 'h-96',
            cardBasis: 'basis-1/3'
        }

    }

    return ( 
        <Carousel className="bg-secondary rounded-2xl p-4 mb-4" opts={{
            align: 'start',
            dragFree: true
        }}>
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-full">
                            {carouselImage && (
                                   <Image src={carouselImage} width={24} height={24} alt={carouselHeader}/>
                            )}
                            </div>
                        <h2 className="text-2xl ">{carouselHeader}</h2>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        <CarouselPrevious />
                         <CarouselNext />
                    </div>
                </div>
                <CarouselContent className="flex gap-2">
                    { limitItem.map((item) => (
                        <CarouselItem className={`cursor-pointer ${sizeConfig[sizeVariant].cardBasis}`} key={item.title} onClick={() => router.push(`/games/${item.id}`)} >
                           <CardComponent item={item} sizeVariant={sizeVariant} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </div>
        </Carousel>
    )
}