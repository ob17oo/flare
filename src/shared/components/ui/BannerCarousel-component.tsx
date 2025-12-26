'use client'
import Image from "next/image"
import { useState } from "react"

interface CarouselItem {
    id: number,
    title: string,
    image_url: string
}

interface BannerCarouselProps{
    carouselItem: CarouselItem[]
}
export function BannerCarouselComponent({carouselItem}: BannerCarouselProps){
    const [currentItem, setCurrentItem] = useState(0)
    return ( 
        <section className="flex gap-4 overflow-x-auto scrollbar-hide cursor-pointer">
            {carouselItem.map((item) => (
                <section className="flex shrink-0 w-[50%] flex-col items-center gap-1" key={item.id}>
                    <div className="relative w-full h-96 overflow-clip rounded-2xl">
                        <Image className="object-cover" fill src={item.image_url} alt={item.title}/>
                    </div>
                    <h2>{item.title}</h2>
                </section>
            ))}
        </section>
    )
}