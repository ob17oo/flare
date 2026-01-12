'use client'
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";
import { useGames } from "@/shared/hooks";
import { useServicesPlatforms } from "@/shared/hooks/useServices/useServices";
import { GameProduct } from "@/shared/types/product.types";
import { TServicePlatform } from "@/shared/types/service.types";

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