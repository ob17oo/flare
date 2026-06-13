'use client'
import { CardComponent } from "@/shared/components"
import GamesFilter from "./games-filter"
import { useMemo, useState } from "react"
import Link from "next/link"
import { GameProduct } from "@/entities/game/model/types"
import { useGames } from "@/entities/game/hooks/useGames"
import { useSearchParams } from "next/navigation"


interface GamesProps{
    initialgames: GameProduct[]
}

export function GamesPage({initialgames}: GamesProps){
    const searchParams = useSearchParams()
    const urlLauncher = searchParams.get('launcher') || 'Все'
    const urlSearch = searchParams.get('search') || ''

    const { 
        data: games = [],
        isLoading,
        isError,
        error
     } = useGames({
        initialData: initialgames
    })

    const [priceFromFilter, setPriceFromFilter] = useState<number | null>(null)
    const [priceToFilter, setPriceToFilter] = useState<number | null>(null)
    const [launcherFilter, setLauncherFilter] = useState(urlLauncher)
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
            const matchesLauncher = launcherFilter === 'Все' || elem.game?.launcher.title === launcherFilter
            const matchesGenre = genreFilter === 'Все' || elem.game?.genre === genreFilter
            const matchesMinPrice = priceFromFilter === null || elem.price >= priceFromFilter
            const matchesMaxPrice = priceToFilter === null || elem.price <= priceToFilter
            const matchesSearch = !urlSearch || elem.title.toLowerCase().includes(urlSearch.toLowerCase())

            return matchesLauncher && matchesGenre && matchesMinPrice && matchesMaxPrice && matchesSearch
        })
    }, [priceFromFilter, priceToFilter, launcherFilter, genreFilter, games, urlSearch])

    const gameLaunchers = useMemo(() => {
        const launchers = games.map((elem) => elem.game?.launcher.title).filter((title) => !!title)
        return ['Все', ...new Set(launchers)] as string[]
    },[games])


    const gameGenre = useMemo(() => {
        const genres = games.map((elem) => elem.game?.genre).filter((genre) => !!genre)
        return ['Все', ...new Set(genres)] as string[]
    },[games])

    const [showFilters, setShowFilters] = useState(false)

    return ( 
        <section className="flex flex-col gap-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">Каталог игр</h1>
                    <p className="text-[14px] text-[var(--text-secondary)] mt-1">Находи лучшие предложения и ключи активации</p>
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    type="button"
                    className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border-muted)] rounded-xl text-[13px] font-semibold text-[var(--text-primary)] cursor-pointer active:scale-95 transition-all duration-300 min-h-11"
                >
                    {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
                <div className={showFilters ? 'block' : 'hidden md:block'}>
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                    { filteredGame.map((item) => (
                        <div key={item.id} className="h-full">
                            <Link href={`/games/${item.id}`} className="block h-full">
                                <CardComponent item={item} sizeVariant="default" />
                            </Link>
                        </div>
                    )) }
                </div>
            </div>
        </section>
    )
}