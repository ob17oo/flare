'use client'
import Image from "next/image"
import Link from "next/link"
import { FOOTER_HELP, FOOTER_INFORMATION, FOOTER_SOCIAL } from "../model/footer.constants"
export function Footer(){
    
    const SmoothScroll = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    // <h3 className="text-[18px]">Наши социальные сети</h3>
    // <h3 className="text-[18px]">Помощь</h3>
    // <h3 className="text-[18px]">Информация</h3>
    return( 
        <footer className="py-7 flex flex-col justify-between border-b-2 border-t-2 border-secondary mb-15 mt-125 h-[30vh]">
            <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col gap-3">
                    <div className="relative w-full h-12 max-w-40 overflow-hidden cursor-pointer">
                        <Image className="object-contain" fill src='/static/icons/Flare-logotype.svg' alt="FooterFlareLogotype"/>
                    </div>
                    <p className="text-h5 opacity-70">Находи выгодные предложения каждый день</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <h4 className="text-h4">Наши социальные сети</h4>
                    <div className="flex gap-6">
                        { FOOTER_SOCIAL.map((social) => (
                            <Link href={social.path} key={social.title}>
                                <Image width={40} height={40} src={social.imageUrl} alt={social.title}/>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <h4 className="text-h4">Помощь</h4>
                    <div className="flex flex-col items-center gap-6">
                        { FOOTER_HELP.map((help) => (
                            <Link className="text-h5 opacity-70" key={help.title} href={help.path}>
                                {help.title}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <h4 className="text-h4">Информация</h4>
                    <div className="flex flex-col items-center gap-6">
                        { FOOTER_INFORMATION.map((info) => (
                            <Link className="text-h5 opacity-80" href={info.path} key={info.title}>
                                {info.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-h5 text-center opacity-50">© 2025-2026 Flare. All rights reserved.</p>
        </footer>
    )
}