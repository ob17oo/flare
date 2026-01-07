'use client'
import { CardComponent } from "@/shared/components"
import { ProductsTypes } from "@/shared/types/product.types"
import GamesFilter from "./games-filter"
import { useMemo, useState } from "react"
import Link from "next/link"

interface GameProps{
    games: ProductsTypes[]
}

export function GamesPage({games}: GameProps){
    const [priceFromFilter, setPriceFromFilter] = useState<number | null>(null)
    const [priceToFilter, setPriceToFilter] = useState<number | null>(null)
    const [launcherFilter, setLauncherFilter] = useState('Все')
    const [genreFilter, setGenreFilter] = useState('Все')

    const priceRange = useMemo(() => {
        const prices = games.map((game) => game.price)

        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        }

    },[games])

    const filteredGame = useMemo(() => {
        return games.filter((elem) => {
            const matchesLauncher = launcherFilter === 'Все' || elem.launcher === launcherFilter
            const matchesGenre = genreFilter === 'Все' || elem.genre === genreFilter
            const matchesMinPrice = priceFromFilter === null || elem.price >= priceFromFilter
            const matchesMaxPrice = priceToFilter === null || elem.price <= priceToFilter

            return matchesLauncher && matchesGenre && matchesMinPrice && matchesMaxPrice
        })
    }, [priceFromFilter, priceToFilter, launcherFilter, genreFilter, games])

    const gameLaunchers = useMemo(() => {
        const launchers = games.map((elem) => elem.launcher)
        const addAll = ['Все', ...launchers]
        return new Set(addAll)
    },[games])


    const gameGenre = useMemo(() => {
        const launchers = games.map((elem) => elem.genre)
        const addAll = ['Все', ...launchers]
        return new Set(addAll)
    },[games])

    return ( 
        <section className="flex flex-col gap-3">
            <div>
                <h2 className="text-2xl text-accent font-bold">Популярные игры</h2>
            </div>
            <div className="flex justify-between gap-3">
                <div className="w-[20%] h-100">
                    <GamesFilter 
                    priceFromFilter={priceFromFilter} 
                    setPriceFromFilter={setPriceFromFilter} 
                    priceToFilter={priceToFilter} 
                    setPriceToFilter={setPriceToFilter}
                    launcherFilter={launcherFilter}
                    setLauncherFilter={setLauncherFilter} 
                    genreFilter={genreFilter}
                    setGenreFilter={setGenreFilter}
                    actualMinPrice={priceRange.min}
                    actualMaxPrice={priceRange.max}

                    launchers={Array.from(gameLaunchers)}
                    genres={Array.from(gameGenre)}
                    />
                </div>
                <div className="w-[80%] grid grid-cols-5 gap-3">
                    { filteredGame.map((item) => (
                        <div key={item.id}>
                            <Link href={`/games/${item.id}`}>
                                <CardComponent item={item} sizeVariant="default" />
                            </Link>
                        </div>
                    )) }
                </div>
            </div>
        </section>
    )
}