import { render, screen } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { InputComponent } from "./Input-component";


describe('InputComponent', () => {
    it('renders input element', () => {
        render(<InputComponent sizeVariant="default" />)

        const input = screen.getByRole('textbox')

        expect(input).toBeInTheDocument()
    })
    it('applies default size classes', () => {
        render(<InputComponent sizeVariant="default"/>)

        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('py-2 px-3')
    })
    it('applies medium size classes', () => {
        render(<InputComponent sizeVariant="medium"/>)

        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('py-3 px-4')
    })

    it('focuses input on click', async () => {
        const user = userEvent.setup()

        render(<InputComponent sizeVariant="default"/>)

        const input = screen.getByRole('textbox')

        await user.click(input)
        expect(input).toHaveFocus()
    })

    it('passes native input props', () => {
        render(
            <InputComponent 
                sizeVariant="default"
                placeholder="Email"
                value="test"
                onChange={() => {}}
            />
        )

        const input = screen.getByPlaceholderText('Email')
        expect(input).toHaveValue('test')
    })
})