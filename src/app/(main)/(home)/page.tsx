import { getAllGames } from "@/shared/actions";
import { getAllServicesPlatform } from "@/shared/actions/products/service";
import { HomePage } from "@/views";

export default async function Home() {
  const initialGames = await getAllGames()
  const initialServicesPlatform = await getAllServicesPlatform()
  return (
      <HomePage 
        initialGames={initialGames} 
        initialServicesPlatform={initialServicesPlatform}
      />
  );
}
