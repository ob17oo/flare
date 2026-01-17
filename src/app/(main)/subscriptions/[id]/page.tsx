import { getAllServicesPlatform } from "@/entities/service/api";
import { getServicePlansByPlatformId } from "@/entities/service/api/getServicePlantsByPlatformId.api";
import { SubscriptionPage } from "@/views";
import { notFound } from "next/navigation";

interface SubscriptionProps{
    params: Promise<{
        id: string
    }>
}

export default async function Service({params}: SubscriptionProps){
    const { id } = await params
    const platforms = await getAllServicesPlatform()
    const platform = platforms.find((platform) => platform.id === parseInt(id))

    if(!platform){
        notFound()
    }

    const servicePlans = await getServicePlansByPlatformId(id)
    return <SubscriptionPage platform={platform} initialPlans={servicePlans} />
}