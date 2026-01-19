
import { getAllGames } from "@/entities/game/api";
import { getAllServicesPlatform } from "@/entities/service/api";
import { getAllWalletProvider } from "@/entities/wallet/api";
import { HomePage } from "@/views";

export default async function Home() {
  const initialGames = await getAllGames()
  const initialServicesPlatform = await getAllServicesPlatform()
  const initialWalletProvider = await getAllWalletProvider()
  return <HomePage initialGames={initialGames} initialServicesPlatform={initialServicesPlatform} initialWalletProvider={initialWalletProvider}/>

}
