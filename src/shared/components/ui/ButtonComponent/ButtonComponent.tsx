import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode,
    isFilled?: boolean,
    color: string,
    px?: string,
    py?: string
}
export function ButtonComponent({children, isFilled, color, px = '4', py = '3', onClick}:ButtonProps) {
    return <button
            onClick={onClick}
            className={`py-${py} px-${px} rounded-2xl ${isFilled ? `bg-${color}` : `border border-${color}`}`} 
        >
            {children}
        </button>
}