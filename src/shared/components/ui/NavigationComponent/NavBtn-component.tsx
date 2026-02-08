import Link from "next/link";

interface NavBtnProps{
    pathName: string,
    href: string,
    placeholder: string
}

export function NavigationButton({pathName, href,placeholder}: NavBtnProps){
    return (
         <Link className={`text-h5 font-bold cursor-pointer py-2.5 px-4 flex items-center justify-center rounded-2xl transition-all duraiton-300 ease-in-out ${pathName === href ? 'bg-accent' : 'bg-secondary'}`} href={href}>{placeholder}</Link>
    )
}