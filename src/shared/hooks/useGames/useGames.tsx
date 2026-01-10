'use client'
import { getAllGames } from "@/shared/actions"
import { getGameById } from "@/shared/actions/products/games"
import { GameProduct } from "@/shared/types/product.types"
import { useQuery } from "@tanstack/react-query"

export const gameKeys = {
    all: ['games'] as const,
    lists: () => [...gameKeys.all, 'list'] as const,
    list: (filters: string) => [...gameKeys.lists(), filters] as const,
    details: () => [...gameKeys.all, 'details'] as const,
    detail: (id: number | string) => [...gameKeys.details(), id] as const,
}
export function useGames(options?: {
    initialData?: GameProduct[],
    enabled?: boolean
}){
    return useQuery({
        queryKey: gameKeys.lists(),
        queryFn: getAllGames,
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}

export function useGame(id: string){
    return useQuery({
        queryKey: gameKeys.detail(id),
        queryFn: () => getGameById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })
}