import { getGameById } from "@/shared/actions/products/games"
import GameContent from "./page-content"
interface GamePageProps {
    params: Promise<{
        id: string
    }>
}
export default async function GamePage({params}: GamePageProps){
    const { id } = await params
    const game =  getGameById(id)

    return (
        <GameContent game={game!} />
    )
}