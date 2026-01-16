import { getServiceById } from "@/entities/service/api";
import { SubscriptionPage } from "@/views";
import { notFound } from "next/navigation";

interface SubscriptionProps{
    params: Promise<{
        id: string
    }>
}

export default async function Service({params}: SubscriptionProps){
    const { id } = await params
    const service = await getServiceById(id) 
    if(!service){
        notFound()
    }
    return <SubscriptionPage initialService={service} />
}