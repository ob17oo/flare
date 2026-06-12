'use client'
import { InputComponent, MenuComponent } from "@/shared/components"
import { Navigaiton } from "@/widgets/NavigationBar/ui/Navigation"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BalanceComponent } from "../BalanceComponent/ui/balance-component"
import { useTheme } from "@/shared/providers"
import { Sun, Moon, Menu } from "lucide-react"

interface HeaderProps {
    serverSession: Session | null
}

export function Header({serverSession}: HeaderProps){
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const router = useRouter()
    const { data: clientSession } = useSession()
    const session = clientSession || serverSession
    const { theme, toggleTheme } = useTheme()

    return ( 
        <section className="my-6 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-6 w-full h-12">
                <div className="flex items-center shrink-0">
                    <button onClick={() => router.push('/')} type="button" className="relative w-32 h-8 cursor-pointer hover:opacity-80 transition-opacity">
                        <Image className="object-contain" fill src={'/static/Flare-logotype.svg'} alt="HeaderFlareLogotype"/>
                    </button>
                </div>
                <div className="flex-1 max-w-2xl mx-auto w-full">
                    <InputComponent sizeVariant="medium" placeholder="Поиск по маркетплейсу..."/>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {session && (
                        <button onClick={() => router.push('/balance/topup')} type="button" className="h-full cursor-pointer">
                            <BalanceComponent balance={session?.user.balance}/>
                        </button>
                    )}
                    <button 
                        onClick={toggleTheme} 
                        type="button" 
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] text-[var(--text-primary)] cursor-pointer transition-all duration-300"
                        title={theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <div className="shrink-0">
                        <button 
                            onClick={() => setDialogIsOpen(true)} 
                            type="button" 
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] text-[var(--text-primary)] cursor-pointer transition-all duration-300"
                        >
                            <Menu size={20} />
                        </button>
                        <MenuComponent isOpen={dialogIsOpen} onClose={() => setDialogIsOpen(false)} session={session}/>
                    </div>
                </div>
            </div>
            <Navigaiton />
        </section>
    )
}

