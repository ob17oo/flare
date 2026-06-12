'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { CardComponent } from "@/shared/components"
import { GameProduct } from "@/entities/game/model/types"
import { DbLauncher } from "@/entities/game/api/getLaunchers.api"
import { Gamepad2 } from "lucide-react"

interface LaunchersPageProps {
  initialLaunchers: DbLauncher[]
  initialGames: GameProduct[]
}

const LaunchersLogos: Record<string, React.ReactNode> = {
  Steam: (
    <svg className="w-5 h-5 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .007c-.453.007-.903.04-1.348.098L6.44 5.378a5.36 5.36 0 0 0-1.077-.11A5.368 5.368 0 0 0 0 10.637c0 1.947 1.033 3.652 2.583 4.593l1.83 2.607a5.385 5.385 0 0 0 5.38 5.353 5.368 5.368 0 0 0 5.369-5.368c0-.36-.041-.708-.107-1.047l5.314-4.223a5.343 5.343 0 0 0 .108-.946 5.368 5.368 0 0 0-5.368-5.368 5.36 5.36 0 0 0-1.144.123L9.851.96C10.556.326 11.26-.005 12 .007zM5.369 6.842a3.797 3.797 0 0 1 3.795 3.795c0 .323-.042.635-.118.934l-2.072 1.343a2.127 2.127 0 0 0-1.605-.733c-.707 0-1.32.348-1.704.88L2.09 11.956c-.328-.408-.521-.926-.521-1.488 0-2.091 1.708-3.796 3.8-3.796zm12.39 5.39c2.092 0 3.796 1.704 3.796 3.796s-1.704 3.796-3.796 3.796-3.796-1.704-3.796-3.796 1.704-3.796 3.796-3.796zm-9.914.86c.642 0 1.16.518 1.16 1.16s-.518 1.16-1.16 1.16-1.16-.518-1.16-1.16.518-1.16 1.16-1.16z" />
    </svg>
  ),
  "Epic Games": (
    <svg className="w-5 h-5 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L1.625 3.125v13.624L12 24l10.375-7.251V3.125L12 0zm7.875 16.125L12 21.625l-7.875-5.5V5.25L12 2.625l7.875 2.625v10.875zM12 5.5l-5 3.5v2l5-3.5 5 3.5v-2l-5-3.5zm-5 7.5l5 3.5 5-3.5v-1.5l-5 3.5-5-3.5V13z" />
    </svg>
  ),
  "Riot Games": (
    <svg className="w-5 h-5 text-[#d11f26]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.28 0h-4.56l-3.32 8.78H7.32l-.99-2.6L0 9.87l2.8 7.37 5.76-1.52v4.8l2.64 1.34 1.83-4.8 6.55 1.73zM7.32 12.33l-2.9 2.91-1.33-3.48 4.23-.74zm8.39-1.92L14 14.8l-1.37-3.6 3.08-1.32z" />
    </svg>
  ),
  "Battle.net": (
    <svg className="w-5 h-5 text-[#00AEFF]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-3.5h-2V7.5h2V13z" />
    </svg>
  ),
  "Ubisoft Connect": (
    <svg className="w-5 h-5 text-blue-500 dark:text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.002 0C5.378 0 0 5.372 0 11.998c0 6.622 5.378 12.002 12.002 12.002 6.62 0 11.998-5.38 11.998-12.002C24 5.372 18.622 0 12.002 0zm0 19.5c-4.136 0-7.5-3.364-7.5-7.502 0-4.136 3.364-7.5 7.5-7.5 4.138 0 7.502 3.364 7.502 7.5 0 4.138-3.364 7.502-7.502 7.502zm3.175-10.4c-.604-.492-1.385-.758-2.18-.75-1.942.023-3.496 1.62-3.472 3.56.01.9.362 1.75.986 2.378l-1.026 1.025c-1.127-1.127-1.76-2.635-1.782-4.225-.04-3.05 2.4-5.55 5.45-5.586 1.543-.02 3.036.564 4.116 1.637l-1.092.961z" />
    </svg>
  ),
  "EA App": (
    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 13.5h-2v-2h2v2zm0-3.5h-2V7.5h2V12z" />
    </svg>
  ),
  "Rockstar Games": (
    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zm-2.8 17.5h-2.1c-.2 0-.4-.1-.5-.2l-2.4-3.1h-2.2v3.1c0 .2-.1.2-.3.2H7.2c-.2 0-.2 0-.2-.2V7.7c0-.2 0-.2.2-.2h4.5c2 0 3.3 1 3.3 2.9 0 1.3-.7 2.2-1.8 2.6l2.3 3.9c.2.3.1.6-.3.6zm-5-6.8h-1.7v2.3h1.7c.9 0 1.4-.4 1.4-1.1-.1-.8-.6-1.2-1.4-1.2z" />
    </svg>
  ),
  Xbox: (
    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.602.062C5.076.438.016 5.612.016 12.158c0 2.613.82 5.033 2.213 7.031l4.908-4.908c-1.393-2.072-2.193-4.57-2.193-7.281 0-.961.107-1.895.312-2.795.127.355.275.727.461 1.094l5.885 5.885 5.885-5.885c.186-.367.334-.739.461-1.094.205.9.312 1.834.312 2.795 0 2.711-.8 5.209-2.193 7.281l4.908 4.908c1.393-1.998 2.213-4.418 2.213-7.031 0-6.546-5.06-11.72-11.586-12.096L12 .594l-.398-.532z" />
    </svg>
  ),
  PlayStation: (
    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-3.5h-2V7.5h2V13z" />
    </svg>
  ),
  Nintendo: (
    <svg className="w-5 h-5 text-[#E60012]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-3.5h-2V7.5h2V13z" />
    </svg>
  )
}

const REQUIRED_LAUNCHERS = [
  { key: 'Steam', title: 'Steam', dbName: 'Steam' },
  { key: 'Epic Games', title: 'Epic Games', dbName: 'Epic Games' },
  { key: 'Riot Games', title: 'Riot Games', dbName: 'Riot Games' },
  { key: 'Battle.net', title: 'Battle.net', dbName: 'Battle.net' },
  { key: 'Ubisoft Connect', title: 'Ubisoft Connect', dbName: 'Ubisoft' },
  { key: 'EA App', title: 'EA App', dbName: 'EA App' },
  { key: 'Rockstar Games', title: 'Rockstar Games', dbName: 'Rockstar' },
  { key: 'Xbox', title: 'Xbox', dbName: 'Microsoft' },
  { key: 'PlayStation', title: 'PlayStation', dbName: 'PlayStation' },
  { key: 'Nintendo', title: 'Nintendo', dbName: 'Nintendo' }
]

export function LaunchersPage({ initialLaunchers = [], initialGames = [] }: LaunchersPageProps) {
  const [activeLauncher, setActiveLauncher] = useState<string | null>(null)

  // DB mapping for image resources
  const mappedLaunchers = useMemo(() => {
    return REQUIRED_LAUNCHERS.map(req => {
      const dbMatch = initialLaunchers.find(db => 
        db.title.toLowerCase().includes(req.dbName.toLowerCase()) || 
        req.dbName.toLowerCase().includes(db.title.toLowerCase())
      )

      return {
        ...req,
        image_url: dbMatch?.image_url || null
      }
    })
  }, [initialLaunchers])

  // Filter games by active launcher
  const filteredGames = useMemo(() => {
    if (!activeLauncher) {
      return initialGames.slice(0, 12) // Default to showing first 12 popular games
    }

    const launcherConfig = REQUIRED_LAUNCHERS.find(l => l.key === activeLauncher)
    if (!launcherConfig) return []

    return initialGames.filter(g => 
      g.game?.launcher.title.toLowerCase().includes(launcherConfig.dbName.toLowerCase()) ||
      launcherConfig.dbName.toLowerCase().includes(g.game?.launcher.title.toLowerCase() || '')
    )
  }, [activeLauncher, initialGames])

  return (
    <section className="flex flex-col gap-8 py-6">
      {/* Title */}
      <div className="flex flex-col gap-1 max-w-xl">
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
          Игровые лаунчеры
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Быстрый переход к товарам выбранной игровой платформы
        </p>
      </div>

      {/* Minimalist filter chips bar (One row scrollable chips with only icons and names) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveLauncher(null)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer shrink-0 border ${
            activeLauncher === null
              ? 'bg-[var(--accent)] border-transparent text-white'
              : 'bg-[var(--secondary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Все платформы
        </button>

        {mappedLaunchers.map((launcher) => {
          const isSelected = activeLauncher === launcher.key
          const logoIcon = LaunchersLogos[launcher.key] || <Gamepad2 size={16} />

          return (
            <button
              key={launcher.key}
              onClick={() => setActiveLauncher(isSelected ? null : launcher.key)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-[var(--bg-layer-3)] border-[var(--accent)] text-[var(--text-primary)] shadow-sm'
                  : 'bg-[var(--secondary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]/20'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center relative shrink-0">
                {launcher.image_url ? (
                  <Image src={launcher.image_url} fill className="object-contain" alt={launcher.title} />
                ) : (
                  logoIcon
                )}
              </div>
              <span>{launcher.title}</span>
            </button>
          )
        })}
      </div>

      {/* Catalog items section header */}
      <div className="flex justify-between items-end border-t border-[var(--border-muted)]/60 pt-8 mt-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[17px] font-bold text-[var(--text-primary)]">
            {activeLauncher ? `Товары: ${activeLauncher}` : 'Популярные игры'}
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)]">
            Доступные ключи активации и цифровые издания
          </p>
        </div>
        
        {/* Minimal link to full catalog filtered by launcher */}
        {activeLauncher && (
          <Link
            href={`/games?launcher=${encodeURIComponent(activeLauncher)}`}
            className="text-[12px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            Смотреть все в каталоге →
          </Link>
        )}
      </div>

      {/* Product Cards Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <div key={game.id} className="h-full">
              <Link href={`/games/${game.id}`} className="block h-full">
                <CardComponent item={game} sizeVariant="default" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl gap-2 text-center">
          <Gamepad2 className="text-[var(--text-secondary)]/30" size={32} />
          <h4 className="text-[14px] font-bold text-[var(--text-primary)]">Игры отсутствуют</h4>
          <p className="text-[12px] text-[var(--text-secondary)] max-w-xs leading-normal">
            Для платформы {activeLauncher} временно нет доступных товаров в каталоге.
          </p>
        </div>
      )}
    </section>
  )
}