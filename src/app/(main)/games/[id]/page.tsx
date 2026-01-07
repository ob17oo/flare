import { getGameById } from "@/shared/actions/products/games"
import { ArrowLeft } from "lucide-react"

interface GamePageProps {
    params: Promise<{
        id: string
    }>
}
export default async function GamePage({params}: GamePageProps){
    const { id } = await params
    const game = await getGameById(id)

    return (
        <section className="flex flex-col gap-3">
            <div className="group transition-all duration-200 ease-in-out">
                <ArrowLeft size={18} color="white"/>
                <button className="flex items-center justify-center bg-accent rounded-full px-3 py-1" type="button">
                    Назад
                </button>
                
            </div>
            <h2 className="text-2xl font-bold">{game?.title}</h2>
        </section>
    )
}