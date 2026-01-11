'use client'
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";
import { useGames, useServices } from "@/shared/hooks";
import { GameProduct, ServicePlanProduct } from "@/shared/types/product.types";

interface HomePageProps {
    initialGames: GameProduct[]
    initialServices: ServicePlanProduct[]
}

export function HomePage({initialGames, initialServices}: HomePageProps){
    const {
        data: games = [],
    } = useGames({
        initialData: initialGames
    })

    const {
        data: services = [],
    } = useServices({
        initialData: initialServices
    })
    console.log(initialServices)
    return ( 
        <>
            <HeroCarouselComponent carouselItem={games} />
            <CarouselComponent sizeVariant="default" carouselItem={games} carouselHeader="Популярные игры" carouselImage="/static/carouselIcons/Games.svg" />
            {/* <CarouselComponent sizeVariant="medium" carouselItem={games} carouselHeader="Популярные кошельки" carouselImage="/static/carouselIcons/Wallets.svg" /> */}
            <CarouselComponent sizeVariant="large" carouselItem={initialServices} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcons/Launchers.svg" />
        </>
    )
}