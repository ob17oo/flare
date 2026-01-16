import { getAllServicesPlatform } from "@/entities/service/api";
import { SubscriptionsPage } from "@/views";

export default async function Subscriptions(){
    const servicesInitialData = await getAllServicesPlatform()
    return <SubscriptionsPage servicesInitialData={servicesInitialData} />
}