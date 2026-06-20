import { ADVATAGES } from "../model/adv.constants";
import Image from "next/image";

export function AdvantagesComponent(){
    return (
        <div className="w-full flex flex-col gap-8 my-16 md:my-20">
            <div className="w-full flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-3">
                <div className="relative overflow-hidden w-28 h-7 md:w-36 md:h-9 shrink-0">
                    <Image className="object-contain" fill src={'/static/Flare-logotype.svg'} alt="AdvantagesFlareLogotype"/>
                </div>
                <h2 className="text-[20px] md:text-[28px] font-bold tracking-tight text-[var(--text-primary)] uppercase">гарантирует</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                { ADVATAGES.map((adv) => (
                    <div key={adv.title} className="bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 shadow-[var(--card-shadow)] transition-all duration-300">
                        <div className="flex justify-center items-center w-14 h-14 rounded-xl bg-[var(--bg-layer-3)] border border-[var(--border-muted)] relative">
                            <Image width={24} height={26} src={adv.imageUrl} alt={adv.title} className="object-contain"/>
                        </div>
                        <div className="flex flex-col gap-2 items-center text-center">
                            <h3 className="text-[16px] md:text-[18px] font-bold text-[var(--text-primary)]">{adv.title}</h3>
                            <p className="text-[13px] md:text-[14.5px] text-[var(--text-secondary)] leading-relaxed max-w-[240px] md:max-w-[280px]">{adv.description}</p>
                        </div>
                    </div>
                )) }
            </div>
        </div>
    )
}