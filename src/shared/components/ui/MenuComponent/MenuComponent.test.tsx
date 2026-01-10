import Image from "next/image";
import { MenuComponent } from "./Menu-component";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLockScroll } from "@/shared/hooks";

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

jest.mock('next/link', () => {
    return function MockLink({children, href, className}: {
        children: React.ReactNode,
        href: string,
        className?: string
    }){
        return ( 
            <a href={href} className={className} data-testid="mock-link">
                {children}
            </a>
        )
    }
})

jest.mock('@/shared/hooks/useLockScroll', () => {
    return {
        useLockScroll: jest.fn()
    }
})

describe('MenuComponent', () => {
    const mockOnClose = jest.fn()
    const mockUseLockScroll = useLockScroll as jest.MockedFunction<typeof useLockScroll>

    beforeEach(() => {
        mockOnClose.mockClear()
        mockUseLockScroll.mockClear()
    })

    test('does not render when false', () => { 
        const { container } = render(<MenuComponent isOpen={false} onClose={mockOnClose}/>)

        expect(container.firstChild).toBeNull()
        expect(mockUseLockScroll).toHaveBeenCalledWith({isOpen: false})
    })

    test('render when isOpen', () => {
        render(<MenuComponent isOpen={true} onClose={mockOnClose}/>)

        const profileLink = screen.getByText('Профиль')
        const close = screen.getByAltText('close')
        expect(profileLink).toBeInTheDocument()
        expect(close).toBeInTheDocument()
        expect(mockUseLockScroll).toHaveBeenCalledWith({isOpen: true})
    })

    test('close on click', async () => { 
        render(<MenuComponent isOpen={true} onClose={mockOnClose}/>)

        const user = userEvent.setup()
        const closeButton = screen.getByAltText('close').closest('button')

        expect(closeButton).toBeInTheDocument()
        
        await user.click(closeButton!)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
})