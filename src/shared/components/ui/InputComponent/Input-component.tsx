type InputSize = 'default' | 'medium'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    sizeVariant: InputSize,
}
export function InputComponent({
    sizeVariant = 'default',
    ...props
}: InputProps){

    const sizeVariantConfig = {
        default: 'h-11 px-3.5',
        medium: 'h-12 px-4',
    }

    return (
        <input 
        {...props}
        className={`w-full text-[14px] font-medium bg-[var(--bg-layer-2)] text-[var(--text-primary)] border border-[var(--border-muted)] rounded-xl outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--border-accent-glow)] placeholder-[var(--text-secondary)]/50 ${sizeVariantConfig[sizeVariant]}`}
        />
    )
}