import { TWalletProvider } from "@/entities/wallet/model/types";
import { InputComponent } from "@/shared/components";
import Image from "next/image";

interface WalletFilterProps{
    walletProvider: TWalletProvider[],
    setPick: (value: number) => void,
    pick: number
}

export function WalletFilter({walletProvider,pick,setPick}: WalletFilterProps){
    return (
        <div className="w-full rounded-2xl bg-[var(--secondary)] border border-[var(--border-muted)] p-4 flex flex-col gap-4 shadow-[var(--card-shadow)]">
            <div>
                <InputComponent sizeVariant="default" placeholder="Поиск лаунчера..."/>
            </div>
            <div className="flex flex-col gap-1.5">
                { walletProvider.map((provider) => {
                    const isSelected = provider.id === pick;
                    return (
                        <button 
                            onClick={() => setPick(provider.id)} 
                            key={provider.id} 
                            className={`flex gap-3 items-center text-[14px] rounded-xl p-2.5 transition-all duration-300 ease-in-out cursor-pointer border ${
                                isSelected 
                                    ? 'bg-[var(--bg-layer-3)] border-[var(--border-muted)] text-[var(--text-primary)] shadow-sm font-semibold' 
                                    : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-layer-3)]/30'
                            }`}
                        >
                            <div className="relative overflow-hidden w-10 h-10 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-layer-0)] shrink-0">
                                <Image className="object-cover" fill src={provider.image_url} alt={provider.title} sizes="40px" />
                            </div>
                            <span className="truncate">{provider.title.replace('Пополнение', '').trim()}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    )
}