'use client'
import Image from "next/image"
import Link from "next/link"
export function Footer(){
    
    const SmoothScroll = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return( 
        <footer className="flex justify-between py-7.5 border-b border-t border-[#1E1E1E] mb-15 mt-125 h-[30vh]">
            <section className="flex flex-col gap-3">
                <button onClick={SmoothScroll} className="text-left text-4xl font-bold text-accent bg-clip-text text-transparent cursor-pointer">FLARE</button>
                <span className="text-[14px]">Находи выгодные предложения каждый день</span>
            </section>
            <section className="flex items-center flex-col gap-3">
                <h3 className="text-[18px]">Наши социальные сети</h3>
                <ul className="flex gap-3">
                    <li className="opacity-70"><Link href="#"><Image width={32} height={32} src="/static/icons/SocialIcons/Vkontakte.svg" alt="Vkontakte"/></Link></li>
                    <li className="opacity-70"><Link href="#"><Image width={32} height={32} src="/static/icons/SocialIcons/Telegram.svg" alt="Telegram"/></Link></li>
                    <li className="opacity-70"><Link href="#"><Image width={32} height={32} src="/static/icons/SocialIcons/Discord.svg" alt="Discord"/></Link></li>
                </ul>
            </section>
            <section className="flex flex-col items-center gap-3">
                <h3 className="text-[18px]">Помощь</h3>
                <ul className="flex flex-col items-gap-3]">
                    <li className="opacity-70"><Link href="">Техническая поддержка</Link></li>
                    <li className="opacity-70"><Link href="">FAQ</Link></li>
                    <li className="opacity-70"><Link href="">Контакты</Link></li>
                </ul>
            </section>
            <section className="flex flex-col gap-3 items-center">
                <h3 className="text-[18px]">Информация</h3>
                <ul className="flex flex-col items-center gap-3">
                    <li className="opacity-70"><Link href="#">О нас</Link></li>
                    <li className="opacity-70"><Link href="#">Пользовательское соглашение</Link></li>
                    <li className="opacity-70"><Link href="#">Партнерская программа</Link></li>
                </ul>
            </section>
        </footer>
    )
}