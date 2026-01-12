import { getGameById } from "@/shared/actions/products/games"
import GameContent from "./page-content"
import { notFound } from "next/navigation"
interface GamePageProps {
    params: Promise<{
        id: string
    }>
}
export default async function GamePage({params}: GamePageProps){
    const { id } = await params
    const game = await getGameById(id)
    if(!game) {
        notFound()
    }
    return (
        <GameContent initialGame={game} gameId={id} />
    )
}