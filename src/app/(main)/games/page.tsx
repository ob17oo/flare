import { getAllGames } from "@/shared/actions";
import { GamesPage } from "@/views";

export default async function Games(){
    const games = await getAllGames()
    return (
        <GamesPage initialgames={games || []} />
    )
}