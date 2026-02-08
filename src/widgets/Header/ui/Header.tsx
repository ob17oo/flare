'use client'
import { InputComponent, MenuComponent } from "@/shared/components"
import { Navigaiton } from "@/widgets/NavigationBar/ui/Navigation"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BalanceComponent } from "../BalanceComponent/ui/balance-component"

interface HeaderProps {
    serverSession: Session | null
}

export function Header({serverSession}: HeaderProps){
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const router = useRouter()
    const { data: clientSession } = useSession()
    const session = clientSession || serverSession
    if( !session ) {
        return 
    }
    return ( 
        <section className="my-4 flex flex-col gap-6">
            <div className="grid grid-cols-[calc(20%-8px)_calc(60%-8px)_calc(20%-8px)] justify-between w-full h-12">
                <div className="h-full w-full max-w-[50%] flex items-center shrink-0">
                    <button onClick={() => router.push('/')} type="button" className="w-full h-full max-w-40 relative overflow-hidden cursor-pointer">
                        <Image className="object-contain" fill src={'/static/icons/Flare-logotype.svg'} alt="HeaderFlareLogotype"/>
                    </button>
                </div>
                <div>
                    <InputComponent sizeVariant="medium" placeholder="Поиск"/>
                </div>
                <div className="w-full h-full flex items-center justify-end gap-6">
                    <div className="h-full">
                        <button type="button" className="h-full cursor-pointer">
                            <BalanceComponent balance={session.user.balance}/>
                        </button>
                    </div>
                    <div className="h-full shrink-0">
                        <button onClick={() => setDialogIsOpen(true)} type="button" className="cursor-pointer">
                            <Image width={48} height={48} src={'/static/icons/burgerMenu.svg'} alt="HeaderBurgerMenu"/>
                        </button>
                        <MenuComponent isOpen={dialogIsOpen} onClose={() => setDialogIsOpen(false)} session={session}/>
                    </div>
                </div>
            </div>
            <Navigaiton />
        </section>
    )
}

