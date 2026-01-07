import { getAllGames } from "@/shared/actions";
import { CarouselComponent, HeroCarouselComponent } from "@/shared/components";

export async function HomePage(){
    const games = await getAllGames()

    return ( 
        <>
            <HeroCarouselComponent carouselItem={games!} />
            <CarouselComponent sizeVariant="default" carouselItem={games!} carouselHeader="Популярные игры" carouselImage="/static/carouselIcon/Games.svg" />
            <CarouselComponent sizeVariant="medium" carouselItem={games!} carouselHeader="Популярные кошельки" carouselImage="/static/carouselIcon/Rocket.svg" />
            <CarouselComponent sizeVariant="large" carouselItem={games!} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcon/Rocket.svg" />
        </>
    )
}