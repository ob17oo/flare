import Link from "next/link";

interface NavBtnProps{
    pathName: string,
    href: string,
    placeholder: string
}

export function NavigationButton({pathName, href,placeholder}: NavBtnProps){
    const isActive = pathName === href || (href !== '/' && pathName.startsWith(href))
    return (
          <Link 
            className={`text-[14px] font-semibold cursor-pointer py-2 px-4 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out border ${isActive ? 'bg-accent bg-[var(--secondary)] border-[var(--border-muted)] text-[var(--text-primary)] shadow-[var(--card-shadow)]' : 'bg-secondary bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--secondary)]/50'}`} 
            href={href}
         >
            {placeholder}
         </Link>
    )
}