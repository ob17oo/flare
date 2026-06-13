
import { useLockScroll } from "@/shared/hooks"
import { Session } from "next-auth"
import Image from "next/image"
import Link from "next/link"

interface MenuProps{
    isOpen: boolean
    onClose: () => void,
    session: Session | null
}
export function MenuComponent({isOpen,onClose, session}: MenuProps){
    useLockScroll({isOpen})
    if(!isOpen) return null
    return (
        <section className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}>
                <div className="w-[85%] sm:w-[350px] md:w-[300px] lg:w-[25%] xl:w-[20%] h-full bg-primary absolute top-0 right-0 transition-all duration-300 ease-in-out p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                        <button className="cursor-pointer" onClick={(e) => {e.stopPropagation();onClose() }} >
                            <Image src="/static/icons/close.svg" width={36} height={36} alt="close"/>
                        </button>
                    </div>
                    <div className="px-6 py-9 flex flex-col gap-6 items-center">
                        { session ? (
                            <Link className="cursor-pointer text-h4 transition-all duration-300 ease-in-out hover:scale-105" href="/profile">Профиль</Link>
                         ) : (
                            <Link className="cursor-pointer text-h4 transition-all duration-300 ease-in-out hover:scale-105" href="/login">Авторизация</Link>
                        )}
                        <Link className="cursor-pointer text-h4 transition-all duration-300 ease-in-out hover:scale-105" href="/about">О нас</Link>
                        <Link className="cursor-pointer text-h4 transition-all duration-300 ease-in-out hover:scale-105" href="/faq">FAQ</Link>
                        <Link className="cursor-pointer text-h4 transition-all duration-300 ease-in-out hover:scale-105" href="/contacts">Контакты</Link>
                        <Link className="cursor-pointer text-h4 transition-all duration-300 ease-in-out hover:scale-105" href="/support">Поддержка</Link>
                        
                        {(session?.user as any)?.role === 'ADMIN' && (
                            <div className="flex flex-col items-center w-full mt-4">
                                <div className="w-12 h-px bg-[#333] mb-8"></div>
                                <Link 
                                    className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#333] hover:border-white hover:bg-white/5 transition-all duration-300 ease-in-out w-full" 
                                    href="/admin"
                                >
                                    <span className="text-[15px] font-medium tracking-wide">Панель Управления</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}