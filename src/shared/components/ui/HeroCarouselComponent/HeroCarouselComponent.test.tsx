import { Product, TBaseProduct } from "@/shared/types/product.types";
import { render, screen, waitFor } from "@testing-library/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { act } from "react";
import { HeroCarouselComponent } from "./Hero-carousel-component";
import userEvent from "@testing-library/user-event";

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

jest.mock('../CardComponent/CardComponent', () => {
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

let mockApi: unknown = null
let onSelectCallback: (() => void) | null = null
jest.mock('@/components/ui/carousel', () => {

    const MockCarousel = ({ children, className, plugins, setApi } : {children: React.ReactNode, className?: string, plugins?: unknown[], setApi?: (api:unknown) => void}) => {
        React.useEffect(() => {
            if(setApi){
                mockApi = {
                    scrollSnapList: () => Array.from({length: 3}),
                    selectedScrollSnap: () => 0,
                    on: (event: string, callback: () => void) => {
                        if(event === 'select'){
                            onSelectCallback = callback   
                        }
                    },
                    scrollTo: jest.fn()
                }
                setApi(mockApi)
            }
        },[setApi])
        return (
        <div data-testid="carousel" className={className}>
            {children}
        </div>
        )
    }

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
    return {
        Carousel: MockCarousel,
        CarouselContent: mockCarouselContent,
        CarouselItem: mockCarouselItem,
    }
})
const simulateSelect = (index:number) => {
    if(mockApi){
        mockApi = {
            ...mockApi,
            selectedScrollSnap: () => index
        }
        onSelectCallback?.()
    }
}

describe('HerCarouselComponent', () => {
     const mockProducts: TBaseProduct[] = [
    {
      id: 1,
      title: 'Cyberpunk 2077',
      description: 'Игра в мире будущего с открытым миром',
      image_url: '/cyberpunk.jpg',
      productType: 'GAME',
      productEdition: 'Standard',
      price: 2999,
      stock: 10,
      rating: 4.5,
      isActive: true,
    },
    {
      id: 2,
      title: 'The Witcher 3',
      description: 'Эпическая RPG про ведьмака Геральта',
      image_url: '/witcher.jpg',
      productType: 'GAME',
      productEdition: 'Standard',
      price: 1999,
      stock: 5,
      rating: 4.8,
      isActive: true,
    },
  ];

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockRouter.push.mockClear();

    mockApi = null
    onSelectCallback = null
  })

  test('render hero-carousel with items', () => {
    render(<HeroCarouselComponent carouselItem={mockProducts}/>)

    const firstTitle = screen.getByText('CYBERPUNK 2077')
    const secondTitle = screen.getByText('THE WITCHER 3')
    const firstDescription = screen.getByText('Игра в мире будущего с открытым миром')
    const secondDescription = screen.getByText('Эпическая RPG про ведьмака Геральта')

    const buttons = screen.getAllByText('Подробнее')

    expect(firstTitle).toBeInTheDocument()
    expect(secondTitle).toBeInTheDocument()
    expect(firstDescription).toBeInTheDocument()
    expect(secondDescription).toBeInTheDocument()
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('navigation on click', async () => {
    render(<HeroCarouselComponent carouselItem={mockProducts}/>)
    const user = userEvent.setup()
    const buttons = screen.getAllByText('Подробнее')

    await user.click(buttons[0])
    expect(mockRouter.push).toHaveBeenCalledWith('/games/1')
    expect(mockRouter.push).toHaveBeenCalledTimes(1)
  })

  test('render slide indicators', async () => {
    render(<HeroCarouselComponent carouselItem={mockProducts}/>)

    await waitFor(() => {
        const indicatorsContainer = screen.getByTestId('carousel').parentElement?.querySelector('div[class*="absolute bottom-4"]')
        expect(indicatorsContainer).toBeInTheDocument()
    })
  })

  test('change slide when simulated', async () => {
    render(<HeroCarouselComponent carouselItem={mockProducts}/>)

    await waitFor(() => {
        expect(mockApi).not.toBeNull()
    })

    act(() => {
        simulateSelect(1)
    }) 
  })
})


