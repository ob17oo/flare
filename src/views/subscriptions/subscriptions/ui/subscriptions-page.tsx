'use client'
import { useServicesPlatforms } from "@/entities/service/hooks/useServices"
import { TServicePlatform } from "@/entities/service/model/types"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

interface SubscriptionsPageProps{
    servicesInitialData: TServicePlatform[]
}

export function SubscriptionsPage({servicesInitialData}: SubscriptionsPageProps){
    const [genreFilter, setGenreFilter] = useState('Все')
    const searchParam = useSearchParams()
    const urlSearch = searchParam.get('search') || ''
    
    const { data: servicePlatform = [] } = useServicesPlatforms({
        initialData: servicesInitialData
    })
    
    const filterServices = useMemo(() => {
        return servicePlatform
            .filter((elem) => genreFilter === 'Все' || elem.category === genreFilter)
            .filter((elem) => !urlSearch || elem.title.toLowerCase().includes(urlSearch.toLowerCase()))
    },[genreFilter,servicePlatform,urlSearch])

    const serviceGenre = useMemo(() => {
        const genre = servicePlatform.map((elemnt) => elemnt.category).filter((title) => !!title)
        return ['Все', ...new Set(genre)] as string[]
    },[servicePlatform])

    return (
        <div className="flex flex-col gap-8 py-4">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">Цифровые подписки</h1>
                    <p className="text-[14px] text-[var(--text-secondary)] mt-1">Подписки на популярные стриминги, софт и развлекательные сервисы</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    { serviceGenre.map((genre, index) => {
                        const isSelected = genreFilter === genre;
                        return (
                            <button 
                                onClick={() => setGenreFilter(serviceGenre[index])} 
                                key={genre} 
                                className={`px-4.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-300 cursor-pointer border ${
                                    isSelected 
                                        ? 'bg-[var(--accent)] text-white border-transparent shadow-sm' 
                                        : 'bg-[var(--secondary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-layer-3)]/40'
                                }`}
                            >
                                {genre}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                { filterServices.map((service) => (
                    <Link key={service.id} href={`/subscriptions/${service.id}`} className="group block">
                        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] p-3 rounded-2xl shadow-[var(--card-shadow)] flex flex-col items-center gap-3 transition-all duration-300 h-full">
                            <div className="relative overflow-hidden rounded-xl w-full aspect-square bg-[var(--bg-layer-0)] border border-[var(--border-muted)]">
                                <Image className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" fill src={service.image_url} alt={service.title} sizes="(max-width: 768px) 150px, 200px" />
                            </div>
                            <h3 className="text-[14px] font-bold text-[var(--text-primary)] text-center leading-tight line-clamp-1 w-full px-1">{service.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}