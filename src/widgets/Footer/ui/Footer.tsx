'use client'
import Image from "next/image"
import Link from "next/link"
import { FOOTER_HELP, FOOTER_INFORMATION, FOOTER_SOCIAL } from "../model/footer.constants"

export function Footer(){
    return( 
        <footer className="pt-16 pb-12 mt-32 border-t border-[var(--border-muted)] flex flex-col gap-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="flex flex-col gap-4">
                    <div className="relative w-32 h-8 cursor-pointer">
                        <Image className="object-contain" fill src='/static/Flare-logotype.svg' alt="FooterFlareLogotype"/>
                    </div>
                    <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                        Премиальный маркетплейс цифровых товаров и услуг. Находи выгодные предложения каждый день.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">Социальные сети</h4>
                    <div className="flex gap-3">
                        { FOOTER_SOCIAL.map((social) => (
                            <Link href={social.path} key={social.title} className="hover:opacity-85 transition-opacity">
                                <Image width={32} height={32} src={social.imageUrl} alt={social.title} className="rounded-lg"/>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">Помощь</h4>
                    <div className="flex flex-col gap-2.5">
                        { FOOTER_HELP.map((help) => (
                            <Link className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" key={help.title} href={help.path}>
                                {help.title}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="text-[14px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">Информация</h4>
                    <div className="flex flex-col gap-2.5">
                        { FOOTER_INFORMATION.map((info) => (
                            <Link className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" href={info.path} key={info.title}>
                                {info.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="pt-8 border-t border-[var(--border-muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[13px] text-[var(--text-secondary)]">© 2025-2026 Flare. Все права защищены.</p>
                <div className="flex gap-6">
                    <Link href="/terms" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Соглашение</Link>
                    <Link href="/privacy" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Конфиденциальность</Link>
                </div>
            </div>
        </footer>
    )
}