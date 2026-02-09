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
            return providers[0].id
        }
    }
    
    const [pickProvider, setPickProvider] = useState<number>(initialProvider())
    const [pickedProduct, setPickedProduct] = useState<WalletProduct | null>(null)

    const pickedWallet = useMemo(() => {
       return wallets.filter((wallet) => wallet.wallet?.walletProvider.id === pickProvider).sort((a,b) => a.price - b.price)
    },[wallets,pickProvider]) 

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

    if(!currentWallet){
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-lg">Выбранный кошелек недоступен</p>
            </div>
        )
    }



    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-h2 font-bold">Пополнение кошельков</h2>
            <div className="grid grid-cols-[calc(20%-8px)_calc(55%-8px)_calc(25%-8px)] gap-6">
                <div>
                    <WalletFilter walletProvider={providers} pick={pickProvider} setPick={setPickProvider}/>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="bg-secondary p-3 rounded-2xl flex gap-3 items-center">  
                        <div className="relative overflow-hidden rounded-2xl w-15 h-15">
                            <Image fill className="object-cover" src={currentWallet.wallet?.walletProvider.image_url || ''} alt={currentWallet.wallet?.walletProvider.title || ''}/>
                        </div>
                        <h4 className="text-h4 text-semibold">{currentWallet.wallet?.walletProvider.title}</h4>
                    </div>
                    <div className="bg-secondary p-3 rounded-2xl flex flex-col gap-3">
                        <h5 className="text-h5">Выберите кол-вол монет:</h5>
                        <div className="grid grid-cols-5 gap-3">
                            { pickedWallet.map((wallet) => (
                                <button onClick={() => setPickedProduct(wallet)} key={wallet.id} className={`flex flex-col transition-all duration-300 ease-in-out ${wallet.id === currentWallet.id ? 'scale-105' : 'scale-100'}`}>
                                    <div className={`relative w-35 h-35 overflow-hidden rounded-2xl border ${wallet.id === currentWallet.id ? ' border-accent' : 'border-transparent'}`}>
                                        <Image className="object-cover" fill src={wallet.image_url} alt={wallet.title}/>
                                        <div className="absolute p-2 w-35 h-35">
                                            <div className="flex flex-col justify-between items-start w-full h-full">
                                                <h5 className="text-h5">{wallet.wallet?.walletProvider.title.replace('Пополнение', '')}</h5>
                                                <h5 className="text-h5">{wallet.wallet?.amountOfCoins} монет</h5>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="text-h4 text-green-400 font-semibold self-start ml-2">{wallet.price} руб</h4>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-secondary p-3 rounded-2xl">
                        <h4 className="text-h4">{currentWallet.description}</h4>
                    </div>
                    <div>
                        <Accordion type="single" collapsible className="flex flex-col gap-3">
                            <AccordionItem value="Способ получения">
                                <AccordionTrigger>Способ получения</AccordionTrigger>
                                <AccordionContent className="text-h5">
                                    На ваш аккаунт по почте будет отправлена подписка продолжительностью, которую вы выбрали
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="Как активировать">
                                <AccordionTrigger>Как активировать</AccordionTrigger>
                                <AccordionContent>
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="FAQ">
                                <AccordionTrigger>FAQ</AccordionTrigger>
                                <AccordionContent>
                                    Что бы активировать переайдите в лаунчер игры которую вы купили, перейдите во вкладку активации промокода и вставьте его
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                     </div>
                </div>
                <div>
                    <PaymentComponent item={currentWallet}/>
                </div>
            </div>
        </div>
    )
}