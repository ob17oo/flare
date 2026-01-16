import { getAllGames } from "@/entities/game/api";
import { GamesPage } from "@/views";

export default async function Games(){
    const games = await getAllGames()
    return <GamesPage initialgames={games || []} />
}