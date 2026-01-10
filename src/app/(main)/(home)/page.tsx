import { getAllGames } from "@/shared/actions";
import { HomePage } from "@/views";

export default async function Home() {
  const initialGames = await getAllGames()
  return (
      <HomePage initialGames={initialGames} />
  );
}
