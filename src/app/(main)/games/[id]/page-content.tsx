'use client'
import { TBaseProduct } from "@/shared/types/product.types";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameContentProps {
    game: TBaseProduct
}

export default function GameContent({game}: GameContentProps){
    const router = useRouter()
    return (
        <section className="flex flex-col gap-3">
            <div>
                <button onClick={() => router.back()} className="text-lg flex items-center justify-center bg-accent rounded-full px-3 cursor-pointer" type="button">
                    <ArrowLeft size={18} color="white"/>
                </button>
            </div>
            <h2 className="text-2xl font-bold">{game?.title}</h2>
        </section>
    )
}