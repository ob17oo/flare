import Link from "next/link";

interface NavBtnProps{
    pathName: string,
    href: string,
    placeholder: string
}

export function NavigationButton({pathName, href,placeholder}: NavBtnProps){
    return (
         <Link className={`text-lg cursor-pointer py-2 px-3 flex items-center justify-center rounded-2xl transition-all duraiton-300 ease-in-out ${pathName.includes(href) ? 'bg-accent' : 'bg-secondary'}`} href={href}>{placeholder}</Link>
    )
}