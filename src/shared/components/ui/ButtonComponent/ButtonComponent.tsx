import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode,
    isFilled?: boolean,
    color: string,
    px?: string,
    py?: string
}

export function ButtonComponent({
    children, 
    isFilled = false, 
    color, 
    px = '4', 
    py = '3', 
    onClick,
    className = '',
    ...props
}: ButtonProps & { className?: string }) {
    
    // Static maps for padding values to prevent tailwind compile issues
    const pxMap: Record<string, string> = {
        '1': 'px-1', '2': 'px-2', '3': 'px-3', '4': 'px-4', '5': 'px-5', '6': 'px-6',
        '2.5': 'px-2.5', '3.5': 'px-3.5', '4.5': 'px-4.5'
    }
    
    const pyMap: Record<string, string> = {
        '1': 'py-1', '2': 'py-2', '3': 'py-3', '4': 'py-4', '5': 'py-5', '6': 'py-6',
        '2.5': 'py-2.5', '3.5': 'py-3.5'
    }
    
    const pxClass = pxMap[px] || 'px-4'
    const pyClass = pyMap[py] || 'py-3'

    // Resolve static styles matching theme variables
    let colorStyles = '';
    
    if (color === 'accent') {
        colorStyles = isFilled 
            ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border border-transparent shadow-[var(--card-shadow)]' 
            : 'border border-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent)]/10'
    } else if (color === 'secondary') {
        colorStyles = isFilled 
            ? 'bg-[var(--bg-layer-3)] hover:bg-[var(--bg-layer-4)] text-[var(--text-primary)] border border-[var(--border-muted)]' 
            : 'border border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--secondary)]/50'
    } else if (color === 'green-400' || color === 'success') {
        colorStyles = isFilled 
            ? 'bg-[var(--success)] hover:opacity-90 text-white border border-transparent' 
            : 'border border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)]/10'
    } else {
        colorStyles = isFilled 
            ? 'bg-[var(--accent)] text-white border border-transparent shadow-[var(--card-shadow)]' 
            : 'border border-[var(--border-muted)] text-[var(--text-primary)]'
    }

    return (
        <button
            onClick={onClick}
            className={`text-[14px] font-semibold ${pyClass} ${pxClass} rounded-xl transition-all duration-300 ease-in-out cursor-pointer active:scale-[0.98] ${colorStyles} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}