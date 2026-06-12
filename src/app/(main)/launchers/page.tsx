import { getAllGames, getAllLaunchers } from "@/entities/game/api"
import { LaunchersPage } from "@/views"

export default async function Launchers() {
  const launchers = await getAllLaunchers()
  const games = await getAllGames()

  return (
    <LaunchersPage initialLaunchers={launchers} initialGames={games} />
  )
}