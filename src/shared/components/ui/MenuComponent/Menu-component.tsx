
import { useLockScroll } from "@/shared/hooks"
import Image from "next/image"
import Link from "next/link"

interface MenuProps{
    isOpen: boolean
    onClose: () => void
}
export function MenuComponent({isOpen,onClose}: MenuProps){
    useLockScroll({isOpen})
    if(!isOpen) return null
    return (
        <section className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}>
                <div className="w-[20%] h-full bg-primary absolute top-0 right-0 transition-all duration-300 ease-in-out p-4">
                    <div className="flex justify-end">
                        <button className="cursor-pointer" onClick={(e) => {e.stopPropagation();onClose() }} >
                            <Image src="/static/close.svg" width={32} height={32} alt="close"/>
                        </button>
                    </div>
                    <div className="px-6 py-9 flex flex-col gap-6 items-center">
                        <Link className="cursor-pointer text-lg transition-all duration-300 ease-in-out hover:scale-105" href="/profile">Профиль</Link>
                        <Link className="cursor-pointer text-lg transition-all duration-300 ease-in-out hover:scale-105" href="/about">О нас</Link>
                        <Link className="cursor-pointer text-lg transition-all duration-300 ease-in-out hover:scale-105" href="/referal">Реферальная система</Link>
                        <Link className="cursor-pointer text-lg transition-all duration-300 ease-in-out hover:scale-105" href="/something">Что-то</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}