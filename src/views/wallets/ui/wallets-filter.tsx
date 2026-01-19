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
        <div className="w-full rounded-2xl bg-secondary p-3 flex flex-col gap-3">
            <div>
                <InputComponent sizeVariant="default" placeholder="Поиск лаунчера"/>
            </div>
            <div className="flex flex-col gap-3">
                { walletProvider.map((provider) => (
                    <button onClick={() => setPick(provider.id)} key={provider.id} className={`flex gap-3 items-center text-lg rounded-2xl p-3 transition-all duration-300 ease-in-out ${provider.id === pick ? 'bg-primary scale-105' : 'bg-transparent'}`}>
                        <div className="relative overflow-hidden w-10 h-10 rounded-2xl">
                            <Image className="object-cover" fill src={provider.image_url} alt={provider.title}/>
                        </div>
                        {provider.title.replace('Пополнение', '')}
                    </button>
                ))}
            </div>
        </div>
    )
}