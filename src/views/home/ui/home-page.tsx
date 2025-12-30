import { getAllGames } from "@/shared/actions";
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";
import { prisma } from "@/shared/lib/prisma";

export async function HomePage(){
    const games = await getAllGames()
    return ( 
        <>
            <HeroCarouselComponent carouselItem={} />
            <CarouselComponent sizeVariant="default" carouselItem={games!} carouselHeader="Популярные игры" carouselImage="/static/carouselIcon/Games.svg" />
            <CarouselComponent sizeVariant="medium" carouselItem={} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcon/Rocket.svg" />
            <CarouselComponent sizeVariant="large" carouselItem={} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcon/Rocket.svg" />
        </>
    )
}