'use client'
import { NavigationButton } from "@/shared/components";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "../model/navigation.constants";

export function Navigaiton(){
    const pathName = usePathname()
    return (
        <section className="flex items-center gap-1 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-2xl p-1 w-full sm:w-fit overflow-x-auto scrollbar-hide">
            { NAV_LINKS.map((link) => (
                <NavigationButton key={link.value} href={link.path} pathName={pathName} placeholder={link.value}/>
            )) }
        </section>
    )
}