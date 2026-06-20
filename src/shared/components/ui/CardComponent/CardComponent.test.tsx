import { render, screen } from '@testing-library/react';
import { CardComponent } from './Card-component';
import '@testing-library/jest-dom';
import Image from 'next/image';
import { GameProduct } from '@/entities/game/model/types';
import { Product } from '@/entities/product/model/types';

// Мокируем next/image
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


describe('CardComponent', () => {
    const mockProduct: Product = {
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
    } as GameProduct

    test('render product card with default size', () => {
        render(<CardComponent item={mockProduct} sizeVariant='default'/>)

        const title = screen.getByText('Cyberpunk 2077')
        const price = screen.getByText('2999 руб')
        const launcher = screen.getByText('Steam')
        expect(title).toBeInTheDocument()
        expect(price).toBeInTheDocument()
        expect(launcher).toBeInTheDocument()
    })

    test('render launcher image for products', () => {
        render(<CardComponent item={mockProduct} sizeVariant='default'/>)

        const images = screen.getAllByRole('img')

        const launcher = screen.getByText('Steam')
        const launcherImage = images.find((img) => img.getAttribute('width') === '24' && img.getAttribute('height') === '24')

        expect(launcherImage).toBeInTheDocument()
        expect(launcher).toBeInTheDocument()
    })

    test('has proper alt text for main image', () => {
        render(<CardComponent item={mockProduct} sizeVariant='default'/>)

        const alt = screen.getByAltText('Cyberpunk 2077')

        expect(alt).toBeInTheDocument()
    })


    test('render product card with medium size', () => {
        render(<CardComponent item={mockProduct} sizeVariant='medium'/>)

        const title = screen.getByText('Cyberpunk 2077')
        expect(title).toBeInTheDocument()

        const price = screen.queryByText('2999 руб')
        expect(price).not.toBeInTheDocument()

        const launcher = screen.queryByText('Steam')
        expect(launcher).not.toBeInTheDocument()

        const description = screen.queryByText('Игра в мире будущего')
        expect(description).not.toBeInTheDocument()
    })

    test('render product card with large size', () => {
        render(<CardComponent item={mockProduct} sizeVariant='large'/>)

        const title = screen.getByText('Cyberpunk 2077')
        const description = screen.getByText('Игра в мире будущего')

        expect(title).toBeInTheDocument()
        expect(description).toBeInTheDocument()

        const price = screen.queryByText('2999 руб')
        expect(price).not.toBeInTheDocument()

        const launcher = screen.queryByText('Steam')
        expect(launcher).not.toBeInTheDocument()
    })
})