import { CarouselComponent } from "@/shared/components";

export  function HomePage(){
    const gameItem = [
        {
            id: 1,
            title: 'First',
            price: 100,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 2,
            title: 'Second',
            price: 80,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 3,
            title: 'Third',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 4,
            title: 'Fourth',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 5,
            title: 'Five',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 6,
            title: 'sixth',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 7,
            title: 'seven',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 8,
            title: 'eight',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 9,
            title: 'nine',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 10,
            title: 'ten',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 11,
            title: 'eleven',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
        {
            id: 12,
            title: 'twelve',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg'
        },
    ]
    const wallets = [
        {
            id: 1,
            title: 'First',
            price: 100,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 2,
            title: 'Second',
            price: 80,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 3,
            title: 'Third',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 4,
            title: 'Fourth',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 5,
            title: 'Five',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 6,
            title: 'sixth',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 7,
            title: 'seven',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 8,
            title: 'eight',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 9,
            title: 'nine',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 10,
            title: 'ten',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 11,
            title: 'eleven',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
        {
            id: 12,
            title: 'twelve',
            price: 120,
            image_url: '/images/Dota2.jpg',
            launcher: 'Steam',
            launcher_url: '/static/launcher-logos/Steam.svg',
            description: 'qpewq]ewqpewqewqewq]epwqe[wqpewq][eqw'
        },
    ]
    const bannerItem = [
        {
            id: 1,
            title: 'first',
            image_url: '/images/Dota2.jpg',
            description: 'orewqpewqpeowqeowqeqw[peoqwp[qoewqepqwoewq[pewoqe[pwqeowq[p'
        },
        {
            id: 2,
            title: 'second',
            image_url: '/images/Dota2.jpg',
            description: 'orewqpewqpeowqeowqeqw[peoqwp[qoewqepqwoewq[pewoqe[pwqeowq[p'
        },
        {
            id: 3,
            title: 'third',
            image_url: '/images/Dota2.jpg',
            description: 'orewqpewqpeowqeowqeqw[peoqwp[qoewqepqwoewq[pewoqe[pwqeowq[p'
        },
        {
            id: 4,
            title: 'fourth',
            image_url: '/images/Dota2.jpg',
            description: 'orewqpewqpeowqeowqeqw[peoqwp[qoewqepqwoewq[pewoqe[pwqeowq[p'
        },
    ]
    return ( 
        <>
            <CarouselComponent sizeVariant="default" carouselItem={gameItem} carouselHeader="Популярные игры" carouselImage="/static/carouselIcon/Games.svg" />
            <CarouselComponent sizeVariant="medium" carouselItem={gameItem} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcon/Rocket.svg" />
            <CarouselComponent sizeVariant="large" carouselItem={wallets} carouselHeader="Популярные лаунчеры" carouselImage="/static/carouselIcon/Rocket.svg" />
        </>
    )
}