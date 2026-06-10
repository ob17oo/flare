import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ServicePlanProduct, TServicePlatform } from "../model/types"
import { getAllServices, getAllServicesPlatform } from "../api"
import { getServicePlansByPlatformId } from "../api/getServicePlantsByPlatformId.api"



export const serviceKeys = {
    all: ['services'] as const,
    lists: () => [...serviceKeys.all, 'list'] as const,
    list: (filter: string) => [...serviceKeys.lists(), filter] as const,

    platforms: () => [...serviceKeys.all, 'platforms'] as const,
    platformsList: () => [...serviceKeys.platforms(), 'list'] as const,

    details: () => [...serviceKeys.all, 'details'] as const,
    planDetail: (id:number | string) => [...serviceKeys.details(), 'plan', id] as const,
    
    platformPlans: (platformId: number | string) => [...serviceKeys.details(), 'platform-plans', platformId] as const
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
        queryKey: serviceKeys.platformsList(),
        queryFn: getAllServicesPlatform,
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false
    })
}

export function useServicePlansByPlatform(
    platformId: string | number,
    options?: {
        initialData?: ServicePlanProduct[],
        enabled?: boolean
    }
){
    return useQuery({
        queryKey: serviceKeys.platformPlans(platformId),
        queryFn: () => getServicePlansByPlatformId(String(platformId)),
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}

export function useServicePlan(
    planId: string | number | null,
    options?: {
        initialData?: ServicePlanProduct,
        enabled?: boolean
    }
){
    return useQuery({
        queryKey: serviceKeys.planDetail(planId || ''),
        queryFn: async () => {
            if(!planId) return undefined
            const allPlans = await getAllServices()
            if(!allPlans) return undefined
            return allPlans.find((plan) => plan.id === Number(planId))
        },
        initialData: options?.initialData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}

export function useInvalidateServices(){
    const queryClient = useQueryClient()

    return {
        invalidateAllServices: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
        invalidateServicePlans: () => queryClient.invalidateQueries({ queryKey: serviceKeys.lists() }),
        invalidateServicePlatform: () => queryClient.invalidateQueries({ queryKey: serviceKeys.platformsList() }),
        invalidatePlatformPlans: (platformId: number | string) => queryClient.invalidateQueries({ queryKey: serviceKeys.platformPlans(platformId) }),
        invalidatePlan: (planId: number | string) => queryClient.invalidateQueries({ queryKey: serviceKeys.planDetail(planId) })
    }
}