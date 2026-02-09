'use client'
import { useServicesPlatforms } from "@/entities/service/hooks/useServices"
import { TServicePlatform } from "@/entities/service/model/types"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"

interface SubscriptionsPageProps{
    servicesInitialData: TServicePlatform[]
}

export function SubscriptionsPage({servicesInitialData}: SubscriptionsPageProps){
    const [genreFilter, setGenreFilter] = useState('Все')
    const { data: servicePlatform = [] } = useServicesPlatforms({
        initialData: servicesInitialData
    })
    
    const filterServices = useMemo(() => {
        return servicePlatform.filter((elem) => genreFilter === 'Все' || elem.category === genreFilter)
    },[genreFilter,servicePlatform])

    const serviceGenre = useMemo(() => {
        const genre = servicePlatform.map((elemnt) => elemnt.category).filter((title) => !!title)
        return ['Все', ...new Set(genre)] as string[]
    },[servicePlatform])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-h2 font-bold">Популярные сервисы</h2>
                <div className="flex items-center gap-3">
                    { serviceGenre.map((genre, index) => (
                        <button onClick={() => setGenreFilter(serviceGenre[index])} key={genre} className={`px-4 py-2.5 rounded-2xl transition-all duration-300 ease-in-out ${genreFilter === genre ? 'bg-accent scale-105' : 'bg-secondary'}`}>
                            <p className="text-lg">{genre}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
                { filterServices.map((service) => (
                    <div key={service.id} className="">
                        <Link href={`/subscriptions/${service.id}`}>
                            <div className="flex flex-col items-center gap-1 w-full h-full">
                                <div className="relative overflow-hidden rounded-2xl w-full aspect-square">
                                    <Image className="object-cover" fill src={service.image_url} alt={service.title}/>
                                </div>
                                <h3 className="text-lg ">{service.title}</h3>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}