import { InputComponent } from "@/shared/components"

interface GameFilterProps {
    priceFromFilter: number | null
    setPriceFromFilter: (value: number | null) => void
    priceToFilter: number | null
    setPriceToFilter: (value: number | null) => void
    launcherFilter: string
    setLauncherFilter: (value: string) => void
    genreFilter: string
    setGenreFilter: (value: string) => void

    actualMinPrice: number
    actualMaxPrice: number

    launchers: string[]
    genres: string[]
}
export default function GamesFilter({priceFromFilter, setPriceFromFilter, priceToFilter, setPriceToFilter, launcherFilter, setLauncherFilter, genreFilter, setGenreFilter, actualMinPrice, actualMaxPrice, launchers, genres}: GameFilterProps){
    return (
        <section className="p-4 w-full bg-secondary rounded-2xl">
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                    <h3 className="text-accent text-lg font-bold">Укажите цену</h3>
                    <div className="flex gap-3 items-center">
                        <InputComponent value={priceFromFilter ?? ''} type="number" onChange={(e) => setPriceFromFilter(e.target.value === '' ? null : Number(e.target.value))} sizeVariant="default" placeholder={`От ${actualMinPrice}`} />
                        <InputComponent value={priceToFilter ?? ''} type="number" onChange={(e) => setPriceToFilter(e.target.value === '' ? null : Number(e.target.value))} sizeVariant="default" placeholder={`До ${actualMaxPrice}`} />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <h3 className="text-accent text-lg font-bold">Лаунчер</h3>
                    <div className="flex flex-col gap-3">
                        {launchers.map((item, index) => (
                            <button key={index} onClick={() => setLauncherFilter(item)} type="button" className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-sm ${launcherFilter === item ? 'bg-accent' : 'bg-primary'}`}></div>
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <h3 className="text-accent text-lg font-bold">Жанр</h3>
                    <div className="flex flex-col gap-3">
                        {genres.map((item, index) => (
                            <button key={index} onClick={() => setGenreFilter(item)} type="button" className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-sm ${genreFilter === item ? 'bg-accent' : 'bg-primary'}`}></div>
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}