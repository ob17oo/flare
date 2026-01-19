'use client'
import { TWalletProvider, WalletProduct } from "@/entities/wallet/model/types"
import { WalletFilter } from "./wallets-filter"
import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PaymentComponent } from "@/features/Payment"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components"

interface WalletsPageProps{
    initialProviders: TWalletProvider[],
    initialWallets: WalletProduct[]
}
export function WalletsPage({initialProviders, initialWallets}: WalletsPageProps){

    if(!initialProviders || !initialWallets){
        notFound()
    }
    const providers = initialProviders
    const wallets = initialWallets
    const [pickProvider, setPickProvider] = useState<number>(providers[0].id)
    const [pickedProduct, setPickedProduct] = useState<WalletProduct | null>(wallets[0])
    const pickedWallet = wallets.filter((wallet) => wallet.wallet?.walletProvider.id === pickProvider)

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold">Пополнение кошельков</h2>
            <div className="grid grid-cols-[calc(20%-8px)_calc(55%-8px)_calc(25%-8px)] gap-6">
                <div>
                    <WalletFilter walletProvider={providers} pick={pickProvider} setPick={setPickProvider}/>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="bg-secondary p-3 rounded-2xl flex gap-3 items-center">  
                        <div className="relative overflow-hidden rounded-2xl w-15 h-15">
                            <Image fill className="object-cover" src={pickedWallet[0].wallet?.walletProvider.image_url || ''} alt={pickedWallet[0].wallet?.walletProvider.title || ''}/>
                        </div>
                        <h2 className="text-lg text-semibold">{pickedWallet[0].wallet?.walletProvider.title}</h2>
                    </div>
                    <div className="bg-secondary p-3 rounded-2xl flex flex-col gap-3">
                        <h2>Выберите кол-вол монет:</h2>
                        <div className="grid grid-cols-5 gap-3">
                            { pickedWallet.map((wallet) => (
                                <button onClick={() => setPickedProduct(wallet)} key={wallet.id} className={`flex flex-col transition-all duration-300 ease-in-out ${wallet === pickedProduct ? 'scale-105' : 'scale-100'}`}>
                                    <div className={`relative w-35 h-35 overflow-hidden rounded-2xl border ${wallet === pickedProduct ? ' border-accent' : 'border-transparent'}`}>
                                        <Image className="object-cover" fill src={wallet.image_url} alt={wallet.title}/>
                                        <div className="absolute p-3 w-35 h-35">
                                            <div className="flex flex-col justify-between items-start w-full h-full">
                                                <p className="text-sm">{wallet.wallet?.walletProvider.title.replace('Пополнение', '')}</p>
                                                <span className="text-sm">{wallet.wallet?.amountOfCoins} монет</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-lg text-green-400 font-semibold self-start ml-2">{wallet.price} руб</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-secondary p-3 rounded-2xl">
                        <p className="text-lg">{pickedProduct.description}</p>
                    </div>
                    <div>
                        <Accordion type="single" collapsible className="flex flex-col gap-3">
                            <AccordionItem value="Способ получения">
                                <AccordionTrigger>Способ получения</AccordionTrigger>
                                <AccordionContent>
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
                    {/* <PaymentComponent item={[]}/> */}
                </div>
            </div>
        </div>
    )
}