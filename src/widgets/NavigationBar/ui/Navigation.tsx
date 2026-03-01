'use client'
import { NavigationButton } from "@/shared/components";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "../model/navigation.constants";

export function Navigaiton(){
    const pathName = usePathname()
    return (
        <section className="flex items-center gap-4">
            { NAV_LINKS.map((link) => (
                <NavigationButton key={link.value} href={link.path} pathName={pathName} placeholder={link.value}/>
            )) }
        </section>
    )
}