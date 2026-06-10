import { InputComponent } from "@/shared/components"
import { Check } from "lucide-react"

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

export default function GamesFilter({
    priceFromFilter, 
    setPriceFromFilter, 
    priceToFilter, 
    setPriceToFilter, 
    launcherFilter, 
    setLauncherFilter, 
    genreFilter, 
    setGenreFilter, 
    actualMinPrice, 
    actualMaxPrice, 
    launchers, 
    genres
}: GameFilterProps){
    return (
        <section className="p-5 w-full bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl shadow-[var(--card-shadow)] flex flex-col gap-6">
            <div className="flex flex-col gap-5">
                {/* Price Filter */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Цена, ₽</h4>
                    <div className="flex gap-2 items-center">
                        <InputComponent 
                            value={priceFromFilter ?? ''} 
                            type="number" 
                            onChange={(e) => setPriceFromFilter(e.target.value === '' ? null : Number(e.target.value))} 
                            sizeVariant="default" 
                            placeholder={`От ${actualMinPrice}`} 
                        />
                        <span className="text-[var(--text-secondary)]/40 text-[12px]">―</span>
                        <InputComponent 
                            value={priceToFilter ?? ''} 
                            type="number" 
                            onChange={(e) => setPriceToFilter(e.target.value === '' ? null : Number(e.target.value))} 
                            sizeVariant="default" 
                            placeholder={`До ${actualMaxPrice}`} 
                        />
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-[var(--border-muted)]" />

                {/* Launcher Filter */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Лаунчер</h4>
                    <div className="flex flex-col gap-1.5">
                        {launchers.map((item, index) => (
                            <button  
                                key={index} 
                                onClick={() => setLauncherFilter(item)} 
                                type="button" 
                                className="flex items-center gap-3 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-layer-3)]/50 p-1.5 rounded-lg w-full text-left transition-all duration-200 cursor-pointer"
                            >
                                <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all duration-200 ${launcherFilter === item ? 'bg-[var(--accent)] border-transparent text-white' : 'bg-[var(--bg-layer-0)] border-[var(--border-muted)]'}`}>
                                    {launcherFilter === item && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span className={launcherFilter === item ? 'font-semibold' : 'opacity-85'}>{item}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-[var(--border-muted)]" />

                {/* Genre Filter */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Жанр</h4>
                    <div className="flex flex-col gap-1.5">
                        {genres.map((item, index) => (
                            <button 
                                key={index} 
                                onClick={() => setGenreFilter(item)} 
                                type="button" 
                                className="flex items-center gap-3 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-layer-3)]/50 p-1.5 rounded-lg w-full text-left transition-all duration-200 cursor-pointer"
                            >
                                <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all duration-200 ${genreFilter === item ? 'bg-[var(--accent)] border-transparent text-white' : 'bg-[var(--bg-layer-0)] border-[var(--border-muted)]'}`}>
                                    {genreFilter === item && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span className={genreFilter === item ? 'font-semibold' : 'opacity-85'}>{item}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}