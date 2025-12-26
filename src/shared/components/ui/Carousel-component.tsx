'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

type SizeVariant = 'default' | 'medium' | 'large'

interface DataType {
    id: number,
    title?: string,
    price?: number,
    image_url: string,
    launcher?: string,
    launcher_url: string
}

interface CarouselProps{
    carouselItem: DataType[],
    carouselHeader: string,
    carouselImage?: string,
    sizeVariant: SizeVariant
}

export function CarouselComponent({carouselItem, carouselHeader, carouselImage, sizeVariant = 'default'}: CarouselProps){
    const router = useRouter()
    const limitItem = carouselItem.slice(0,12)
    const sizeConfig = {
        default: 'w-[15%]',
        medium: '',
        large: 'w-[50%]'
    }


    return ( 
        <Carousel className="bg-secondary rounded-2xl p-4 mb-4" opts={{
            align: 'start',
            dragFree: true
        }}>
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-full">
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
                <CarouselContent className="">
                    { limitItem.map((item) => (
                        <CarouselItem className="basis-1/6 cursor-pointer" key={item.title} onClick={() => router.push(`/games/${item.id}`)} >
                            <div className="p-1">
                            <div className="relative h-72 overflow-hidden rounded-2xl">
                                <Image className="object-cover" fill src={item.image_url} alt={item.title || 'CarouselItem'} />
                                <div className="absolute bottom-3 left-3 bg-[#6D6D6D]/60 rounded-2xl px-2 py-1">
                                   <div className="flex items-center gap-2">
                                        <Image src={item.launcher_url} width={24} height={24} alt={item.launcher || 'LauncherLogo'}/>
                                        <p className="text-lg">{item.launcher}</p>
                                   </div>
                                </div>
                            </div>
                                <span className="text-lg text-green-400 font-semibold">{item.price} руб</span>
                                <p className="text-lg">{item.title}</p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </div>
        </Carousel>
    )
}