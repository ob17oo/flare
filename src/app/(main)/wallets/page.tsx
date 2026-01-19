import { getAllWalletProvider } from "@/entities/wallet/api";
import { getWallets } from "@/entities/wallet/api/getWallets.api";
import { WalletsPage } from "@/views";
import { notFound } from "next/navigation";

export default async function Wallet(){
    const providers = await getAllWalletProvider()
    const wallets = await getWallets()
    if(!providers || !wallets){
        notFound()
    }
    return <WalletsPage initialProviders={providers} initialWallets={wallets}/>
}