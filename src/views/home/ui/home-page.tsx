'use client'
import { useGames } from "@/entities/game/hooks/useGames";
import { GameProduct } from "@/entities/game/model/types";
import { useServicesPlatforms } from "@/entities/service/hooks/useServices";
import { TServicePlatform } from "@/entities/service/model/types";
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";

interface HomePageProps {
    initialGames: GameProduct[]
    initialServicesPlatform: TServicePlatform[]
}

export function HomePage({initialGames, initialServicesPlatform}: HomePageProps){
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
    return ( 
        <>
            <HeroCarouselComponent carouselItem={games} />
            <CarouselComponent sizeVariant="default" carouselItem={games} carouselHeader="Популярные игры" carouselImage="/static/carouselIcons/Games.svg" />
            <CarouselComponent sizeVariant="medium" carouselItem={games} carouselHeader="Популярные кошельки" carouselImage="/static/carouselIcons/Wallets.svg" />
            <CarouselComponent sizeVariant="large" carouselItem={servicesPlatform} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcons/Launchers.svg" />
        </>
    )
}