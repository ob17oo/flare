import { render, screen } from "@testing-library/react"
import { NavigationButton } from "./NavBtn-component"
import '@testing-library/jest-dom'

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

describe('NavigationButton', () => {
    it('renders navigation button with placeholder', () => {
        render(<NavigationButton pathName="/" href="/" placeholder="Главная"/>)

        const placeholder = screen.getByText('Главная')

        expect(placeholder).toBeInTheDocument()
    })

    it('applies active classes', () => {
        render(<NavigationButton pathName="/test" href="/test" placeholder="TestActive"/>)

        const link = screen.getByTestId('mock-link')
        expect(link).toHaveClass('bg-accent')
    })

    it('applies inactive classes when path dont match', () => {
        render(<NavigationButton pathName="/home" href="/game" placeholder="TestInactive"/>)

        const link = screen.getByTestId('mock-link')

        expect(link).toHaveClass('bg-secondary')
    })

    it('render navigation button with href', () => {
        render(<NavigationButton pathName="/" href="/testHref" placeholder="TestHref"/>)

        const href =  screen.getByTestId('mock-link')

        expect(href).toHaveAttribute('href', '/testHref')
    })
})