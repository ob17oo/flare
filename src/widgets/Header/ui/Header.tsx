'use client'
import { InputComponent, MenuComponent } from "@/shared/components"
import { Navigaiton } from "@/widgets/NavigationBar/ui/Navigation"
import { Session } from "next-auth"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface HeaderProps{
    session: Session | null
}

export function Header({session}: HeaderProps){
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const router = useRouter()

    return ( 
        <section className="mb-4">
            <section className="py-4 flex items-center justify-between">
                <section>
                    <button onClick={() => router.push('/')} className="text-4xl font-bold text-accent cursor-pointer">FLARE</button>
                </section>
                <section className="w-[70%]">
                    <InputComponent sizeVariant="default" type="text" placeholder="Поиск"/>
                </section>
                <section className="flex items-center py-2 px-3 gap-2 border border-accent rounded-2xl">
                    <div className="flex items-center gap-1">
                        <p className="text-lg ">{session?.user.balance}</p>
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent">
                            <Image src="/static/icons/ruble.svg" width={18} height={18} alt="Ruble"/>
                        </span>
                    </div>
                    <div className="text-lg text-accent">|</div>
                    <div className="flex items-center gap-1">
                        <p className="text-lg ">{session?.user.discount}</p>
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent">
                            <Image src="/static/icons/percent.svg" width={18} height={18} alt="Percent"/>
                        </span>
                    </div>
                </section>
                <section className="">
                    <button type="button" className="cursor-pointer" onClick={() => setDialogIsOpen(true)}>
                        <Image src="/static/icons/menu.svg" width={28} height={28} alt="Menu"/>
                    </button>
                    <MenuComponent isOpen={dialogIsOpen} onClose={() => setDialogIsOpen(false)} session={session}/>
                </section>
            </section>
            <Navigaiton />
        </section>
    )
}