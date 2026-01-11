import { getAllGames } from "@/shared/actions";
import { getAllServices } from "@/shared/actions/products/service";
import { HomePage } from "@/views";

export default async function Home() {
  const initialGames = await getAllGames()
  const initialServices = await getAllServices()
  return (
      <HomePage 
        initialGames={initialGames} 
        initialServices={initialServices}
      />
  );
}
