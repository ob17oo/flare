import Image from "next/image";
import { useRouter } from "next/navigation";
import { CarouselComponent } from "./Carousel-component";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Product } from "@/entities/product/model/types";
import { GameProduct } from "@/entities/game/model/types";

jest.mock('next/image', () => {
  const mockImage = ({
     src,
     alt,
     width,
     height,
     className,
     fill,
     ...props
  }: React.ComponentProps<typeof Image> & {fill?: boolean}) => {
    const imgProps = {
        src: src as string,
        alt: alt as string,
        className: className as string,
        ...props
    }

    if(fill){
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...imgProps} data-testid={`image-fill-${alt || 'unknown' }`}/>
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img 
            {...imgProps}
            width={width as number}
            height={height as number}
            data-testid={`image-${width}x${height}-${alt || 'unknown'}`}
        />
    )
  }

  mockImage.displayName="MockImage"

  return {
    __esModule: true,
    default: mockImage
  }
});

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

jest.mock('../CardComponent/Card-component', () => {
    const mockCardComponent = ({item, sizeVariant}: {item: Product, sizeVariant: string}) => (
        <div data-testid="card-component">
            {item.title} - {sizeVariant}
        </div>
    )

    mockCardComponent.displaName="MockCardComponent"
    return {
        CardComponent: mockCardComponent
    }
})

jest.mock('@/shared/components/ui/shadCN/carousel', () => {
    const mockCarousel = ({ children, className, opts } : {children: React.ReactNode, className?: string, opts?: unknown}) => (
        <div data-testid="carousel" className={className} data-opts={JSON.stringify(opts)}>
            {children}
        </div>
    )

    const mockCarouselContent = ({ children, className } : {children: React.ReactNode, className: string}) => (
         <div data-testid="carousel-content" className={className}>
            {children}
         </div>
    )

    const mockCarouselItem = ({ children, className, onClick } : {children: React.ReactNode, className?: string, onClick?: () => void}) => (
        <div data-testid="carousel-item" className={className} onClick={onClick}>
            {children}
        </div>
    )

    const mockCarouselPrevious = () => (
        <button data-testid="carousel-previous">Назад</button>
    )
    
    const mockCarouselNext = () => (
        <button data-testid="carousel-next">Вперед</button>
    )

    return {
        Carousel: mockCarousel,
        CarouselContent: mockCarouselContent,
        CarouselItem: mockCarouselItem,
        CarouselPrevious: mockCarouselPrevious,
        CarouselNext: mockCarouselNext
    }
})


describe('CarouselComponent', () => {
    const mockProduct: Product[] = [
        {
            id: 1,
            title: 'Cyberpunk 2077',
            description: 'Игра в мире будущего',
            image_url: '/cyberpunk.jpg',
            productType: 'GAME',
            productEdition: 'Standard',
            price: 2999,
            stock: 10,
            rating: 4,
            isActive: true,
            game: {
                id: 1,
                productId: 1,
                launcherId: 1,
                launcher: {
                    id: 1,
                    title: 'Steam',
                    image_url: '/steam-logo.png'
                },
                genre: 'RPG'
            }
    } as GameProduct,
    {
        id: 2,
        title: 'The Witcher 3',
        description: 'Игра про ведьмака',
        image_url: '/witcher.jpg',
        productType: 'GAME',
        productEdition: 'Standard',
        price: 1999,
        stock: 5,
        rating: 4.8,
        isActive: true,
        game: {
            id: 2,
            productId: 2,
            launcherId: 1,
            launcher: {
            id: 1,
            title: 'Steam',
            image_url: '/steam-logo.png',
            },
            genre: 'RPG',
        },
    } as GameProduct,
    ]

    const mockRouter = {
        push:jest.fn()
    }

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter)
        mockRouter.push.mockClear()
    })


    test('render carousel with header and items', () => {
        render(<CarouselComponent carouselValue="games" carouselItem={mockProduct} carouselHeader="Популярные игры" carouselImage="/game-icon.png" sizeVariant="default"/>)


        const header = screen.getByText('Популярные игры')
        const firstTitle = screen.getByText('Cyberpunk 2077 - default')
        const secondTitle = screen.getByText('The Witcher 3 - default')
        const prevButton = screen.getByTestId('carousel-previous')
        const nextButton = screen.getByTestId('carousel-next')
        const headerIcon = screen.getByAltText('Популярные игры')

        expect(header).toBeInTheDocument()
        expect(firstTitle).toBeInTheDocument()
        expect(secondTitle).toBeInTheDocument()
        expect(prevButton).toBeInTheDocument()
        expect(nextButton).toBeInTheDocument()
        expect(headerIcon).toBeInTheDocument()
        expect(headerIcon).toHaveAttribute('src', '/game-icon.png')
    }) 

    test('render without image when CarouselImage is missed', () => {
        render(<CarouselComponent carouselValue="games" carouselItem={mockProduct} carouselHeader="Новые игры" sizeVariant="default"/>)

        const header = screen.getByText('Новые игры')
        const icon = screen.queryByAltText('Новые игры')

        expect(header).toBeInTheDocument()
        expect(icon).not.toBeInTheDocument()
    })

    test('navigation on click', async () => {
        render(<CarouselComponent carouselValue="games" carouselItem={mockProduct} carouselHeader="Navigation Test" sizeVariant="default"/>)

        const user = userEvent.setup()
        const items = screen.getAllByTestId('carousel-item')

        await user.click(items[0])
        expect(mockRouter.push).toHaveBeenCalledWith('/games/1')
        expect(mockRouter.push).toHaveBeenCalledTimes(1)

        await user.click(items[1])
        expect(mockRouter.push).toHaveBeenCalledWith('/games/2')
        expect(mockRouter.push).toHaveBeenCalledTimes(2)
    })

    test('applies medium size classes', () => {
        render(<CarouselComponent carouselValue="games" carouselItem={mockProduct} carouselHeader="Size Test" sizeVariant="medium"/>)

        const items = screen.getAllByTestId('carousel-item')
        expect(items[0]).toHaveClass('lg:basis-1/4')
    })

    test('applies lagre size classes', () => {
        render(<CarouselComponent carouselValue="games" carouselItem={mockProduct} carouselHeader="Size Test" sizeVariant="large"/>)

        const items = screen.getAllByTestId('carousel-item')
        expect(items[0]).toHaveClass('md:basis-1/3')
    })
})