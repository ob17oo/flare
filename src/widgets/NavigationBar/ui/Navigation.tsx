'use client'
import { NavigationButton } from "@/shared/components";
import { usePathname } from "next/navigation";

export function Navigaiton(){
    const pathName = usePathname()
    return (
        <section className="flex items-center gap-4">
            <NavigationButton href='/games' pathName={pathName} placeholder="Игры" />
            <NavigationButton href='/launchers' pathName={pathName} placeholder="Лаунчеры" />
            <NavigationButton href='/steam' pathName={pathName} placeholder="Steam" />
            <NavigationButton href='/wallets' pathName={pathName} placeholder="Пополнение кошельков" />
            <NavigationButton href='/subscriptions' pathName={pathName} placeholder="Подписки" />
            <NavigationButton href='/sales' pathName={pathName} placeholder="Скидки" />
        </section>
    )
}