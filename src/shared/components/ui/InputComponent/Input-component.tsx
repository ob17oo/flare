type InputSize = 'default' | 'medium'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    sizeVariant: InputSize,
}
export function InputComponent({
    sizeVariant = 'default',
    ...props
}: InputProps){

    const sizeVariantConfig = {
        default: 'py-2 px-3',
        medium: 'py-3 px-4',
    }

    return (
        <input 
        {...props}
        className={`w-full text-lg border-2 border-accent rounded-2xl outline-0 opacity-70 transition-all duration-300 ease-in-out focus:scale-102 focus:opacity-100 ${sizeVariantConfig[sizeVariant]}`}
        />
    )
}