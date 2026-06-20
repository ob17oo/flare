'use client'
import { TWalletProvider, WalletProduct } from "@/entities/wallet/model/types"
import { WalletFilter } from "./wallets-filter"
import { useMemo, useState } from "react"
import Image from "next/image"
import { PaymentComponent } from "@/features/Payment"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components"
import { useSearchParams } from "next/navigation"

interface WalletsPageProps{
    initialProviders: TWalletProvider[],
    initialWallets: WalletProduct[]
}
export function WalletsPage({initialProviders, initialWallets}: WalletsPageProps){
    const searchParam = useSearchParams()
    const paramId = searchParam.get('walletId')
    const providers = initialProviders
    const wallets = initialWallets

    const initialProvider = () => {
        if(paramId){
            const parsedId = parseInt(paramId)
            return parsedId
        } else {
            const firstProvider = providers[0]
            return firstProvider ? firstProvider.id : 0
        }
    }
    
    const [pickProvider, setPickProvider] = useState<number>(initialProvider())
    const [pickedProduct, setPickedProduct] = useState<WalletProduct | null>(null)

    const urlSearch = searchParam.get('search') || ''

    const pickedWallet = useMemo(() => {
       return wallets
           .filter((wallet) => {
               if (!urlSearch) {
                   return wallet.wallet?.walletProvider.id === pickProvider;
               }
               return wallet.title.toLowerCase().includes(urlSearch.toLowerCase());
           })
           .sort((a,b) => a.price - b.price)
    },[wallets,pickProvider,urlSearch])

    const currentWallet = useMemo(() => {
        if(pickedProduct && pickedWallet.some((w) => w.id === pickedProduct.id)){
            return pickedProduct
        }
        return pickedWallet[0]
    },[pickedWallet, pickedProduct])

    if(!initialWallets || initialProviders.length === 0){
        return (
            <div className="flex items-center justify-center">
                <p className="text-lg">Провайдеры кошельков недоступны</p>
            </div>
        )
    }
    
    if(!initialWallets || initialWallets.length === 0){
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-lg">Кошельки недоступны</p>
            </div>
        )
    }

    if(!currentWallet && !urlSearch){
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-lg">Выбранный кошелек недоступен</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 py-4">
            <div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">Пополнение баланса кошельков</h1>
                <p className="text-[14px] text-[var(--text-secondary)] mt-1">Быстрое пополнение баланса Steam, PSN, Xbox и других платформ</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_340px] gap-8">
                {/* Filter Sidebar */}
                <div>
                    <WalletFilter walletProvider={providers} pick={pickProvider} setPick={setPickProvider}/>
                </div>
                
                {/* Main Content Area */}
                <div className="flex flex-col gap-6">
                    {/* Active Provider Info Banner */}
                    {currentWallet && (
                        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-4 rounded-2xl flex gap-3.5 items-center shadow-[var(--card-shadow)]">  
                            <div className="relative overflow-hidden rounded-xl w-12 h-12 border border-[var(--border-muted)] bg-[var(--bg-layer-0)] shrink-0">
                                <Image fill className="object-cover" src={currentWallet.wallet?.walletProvider.image_url || ''} alt={currentWallet.wallet?.walletProvider.title || ''}/>
                            </div>
                            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">{currentWallet.wallet?.walletProvider.title}</h3>
                        </div>
                    )}
                    
                    {/* Coin Pack Grid */}
                    <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl flex flex-col gap-4 shadow-[var(--card-shadow)]">
                        <h4 className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Выберите сумму пополнения:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                            { pickedWallet.map((wallet) => {
                                const isCurrent = currentWallet && wallet.id === currentWallet.id;
                                return (
                                    <button 
                                        onClick={() => setPickedProduct(wallet)} 
                                        key={wallet.id} 
                                        className={`group flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 text-left cursor-pointer ${
                                            isCurrent 
                                                ? 'bg-[var(--bg-layer-3)] border-[var(--accent)] shadow-[var(--card-shadow)] scale-[1.02]' 
                                                : 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] hover:border-[var(--text-secondary)]'
                                        }`}
                                    >
                                        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-[var(--bg-layer-0)]">
                                            <Image className="object-cover transition-transform duration-500 group-hover:scale-105" fill src={wallet.image_url} alt={wallet.title} sizes="120px" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-2.5">
                                                <span className="text-[10px] font-semibold tracking-wider text-white/70 uppercase">
                                                    {wallet.wallet?.walletProvider.title.replace('Пополнение', '').trim()}
                                                </span>
                                                <span className="text-[14px] font-extrabold text-white leading-tight">
                                                    {wallet.wallet?.amountOfCoins} монет
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-1 flex flex-col">
                                            <span className="text-[14px] font-extrabold text-[var(--text-primary)]">
                                                {wallet.price.toLocaleString('ru-RU')} ₽
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                            { pickedWallet.length === 0 && (
                                <div className="col-span-full py-12 text-center text-[var(--text-secondary)]">
                                    Ничего не найдено по запросу &quot;{urlSearch}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Description */}
                    {currentWallet && (
                        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl shadow-[var(--card-shadow)]">
                            <h4 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">Детали услуги</h4>
                            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{currentWallet.description}</p>
                        </div>
                    )}
                    
                    {/* Accordions */}
                    <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl shadow-[var(--card-shadow)]">
                        <Accordion type="single" collapsible className="flex flex-col gap-1">
                            <AccordionItem value="Способ получения" className="border-b border-[var(--border-muted)] py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">Способ получения</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    На ваш аккаунт по почте будет отправлена подписка продолжительностью, которую вы выбрали
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="Как активировать" className="border-b border-[var(--border-muted)] py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">Как активировать</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="FAQ" className="border-none py-1">
                                <AccordionTrigger className="text-[14px] font-semibold text-[var(--text-primary)] hover:no-underline">FAQ</AccordionTrigger>
                                <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                     </div>
                </div>
                
                {/* Checkout Column */}
                <div className="h-fit">
                    {currentWallet && <PaymentComponent item={currentWallet}/>}
                </div>
            </div>
        </div>
    )
}