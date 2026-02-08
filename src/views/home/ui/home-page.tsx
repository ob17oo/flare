'use client'
import { useGames } from "@/entities/game/hooks/useGames";
import { GameProduct } from "@/entities/game/model/types";
import { useServicesPlatforms } from "@/entities/service/hooks/useServices";
import { TServicePlatform } from "@/entities/service/model/types";
import { TWalletProvider } from "@/entities/wallet/model/types";
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";
import { AdvantagesComponent } from "./AdvantagesComponent/ui/advantages-component";

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
    return ( 
        <section className="flex flex-col gap-6">
            <HeroCarouselComponent carouselItem={games} />
            <CarouselComponent carouselValue="games" sizeVariant="default" carouselItem={games} carouselHeader="Популярные игры" carouselImage="/static/carouselIcons/Games.svg" />
            <CarouselComponent carouselValue="subscriptions" sizeVariant="medium" carouselItem={servicesPlatform} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcons/Launchers.svg" />
            <AdvantagesComponent />
            <CarouselComponent carouselValue="wallets" sizeVariant="large" carouselItem={wallet} carouselHeader="Популярные кошельки" carouselImage="/static/carouselIcons/Wallets.svg" />
        </section>
    )
}