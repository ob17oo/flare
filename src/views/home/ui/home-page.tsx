'use client'
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";
import { useGames } from "@/shared/hooks";
import { GameProduct } from "@/shared/types/product.types";

interface HomePageProps {
    initialGames: GameProduct[]
}

export function HomePage({initialGames}: HomePageProps){
    const {
        data: games = [],
        isLoading,
        isError,
        error
    } = useGames({
        initialData: initialGames
    })

    return ( 
        <>
            <HeroCarouselComponent carouselItem={games} />
            <CarouselComponent sizeVariant="default" carouselItem={games} carouselHeader="Популярные игры" carouselImage="/static/carouselIcon/Games.svg" />
            <CarouselComponent sizeVariant="medium" carouselItem={games} carouselHeader="Популярные кошельки" carouselImage="/static/carouselIcon/Rocket.svg" />
            <CarouselComponent sizeVariant="large" carouselItem={games} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcon/Rocket.svg" />
        </>
    )
}