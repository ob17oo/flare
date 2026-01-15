import { getGameById } from "@/shared/actions/products/games"
import { GamePage } from "@/views"
import { notFound } from "next/navigation"
interface GamePageProps {
    params: Promise<{
        id: string
    }>
}
export default async function Game({params}: GamePageProps){
    const { id } = await params
    const game = await getGameById(id)
    if(!game) {
        notFound()
    }
    return (
        <GamePage initialGame={game} gameId={id} />
    )
}