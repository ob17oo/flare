'use client'
import { useGames } from "@/entities/game/hooks/useGames";
import { GameProduct } from "@/entities/game/model/types";
import { useServicesPlatforms } from "@/entities/service/hooks/useServices";
import { TServicePlatform } from "@/entities/service/model/types";
import { TWalletProvider } from "@/entities/wallet/model/types";
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";
import { AdvantagesComponent } from "./AdvantagesComponent/ui/advantages-component";
import { useTheme } from "@/shared/providers";

interface HomePageProps {
    initialGames: GameProduct[]
    initialServicesPlatform: TServicePlatform[]
    initialWalletProvider: TWalletProvider[]
}

export function HomePage({initialGames, initialServicesPlatform,initialWalletProvider}: HomePageProps){
    const {
        data: games = [],
    } = useGames({
        initialData: initialGames
    })

    const {
        data: servicesPlatform = [],
    } = useServicesPlatforms({
        initialData: initialServicesPlatform
    })
    const wallet = initialWalletProvider

    const { theme } = useTheme()
    const isLight = theme === 'light'
    
    const gamesIcon = isLight ? "/static/carouselIcons/games_accent.svg" : "/static/carouselIcons/games.svg"
    const launchersIcon = isLight ? "/static/carouselIcons/launchers_accent.svg" : "/static/carouselIcons/launchers.svg"
    const walletsIcon = isLight ? "/static/carouselIcons/wallets_accent.svg" : "/static/carouselIcons/wallets.svg"

    return ( 
        <section className="flex flex-col gap-10">
            <HeroCarouselComponent />
            <CarouselComponent carouselValue="games" sizeVariant="default" carouselItem={games} carouselHeader="Популярные игры" carouselImage={gamesIcon} />
            <CarouselComponent carouselValue="subscriptions" sizeVariant="medium" carouselItem={servicesPlatform} carouselHeader="Популярные лаунчеры" carouselImage={launchersIcon} />
            <AdvantagesComponent />
            <CarouselComponent carouselValue="wallets" sizeVariant="large" carouselItem={wallet} carouselHeader="Популярные кошельки" carouselImage={walletsIcon} />
        </section>
    )
}