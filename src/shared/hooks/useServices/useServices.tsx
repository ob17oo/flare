import { ServicePlanProduct } from "@/shared/types/product.types"
import { useQuery } from "@tanstack/react-query"
import { gameKeys } from "../useGames/useGames"
import { getAllServices } from "@/shared/actions/products/service"

export const serviceKeys = {
    all: ['service'] as const,
    lists: () => [...serviceKeys.all, 'list'] as const,
    list: (filter: string) => [...serviceKeys.lists(), filter] as const,
    details: () => [...serviceKeys.all, 'details'] as const,
    detail: (id: number | string) => [...serviceKeys.details(), id]  as const
}

export function useServices(options?: {
    initialData?: ServicePlanProduct[],
    enabled?: boolean
}){
    return useQuery({
        queryKey: gameKeys.lists(),
        queryFn: getAllServices,
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false
    })
}