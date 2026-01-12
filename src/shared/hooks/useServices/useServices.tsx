import { ServicePlanProduct } from "@/shared/types/product.types"
import { useQuery } from "@tanstack/react-query"
import { getAllServices, getAllServicesPlatform } from "@/shared/actions/products/service"
import { TServicePlatform } from "@/shared/types/service.types"

export const serviceKeys = {
    all: ['services'] as const,
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
        queryKey: serviceKeys.lists(),
        queryFn: getAllServices,
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false
    })
}

export function useServicesPlatforms(options?: {
    initialData?: TServicePlatform[]
    enabled?: boolean
}){
    return useQuery({
        queryKey: serviceKeys.lists(),
        queryFn: getAllServicesPlatform,
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false
    })
}