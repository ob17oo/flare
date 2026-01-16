'use server'
import { authOptions } from "@/shared/lib/auth"
import { ProfilePage } from "@/views"
import { getServerSession } from "next-auth"

export default async function Profile(){
    const session = await getServerSession(authOptions)
    if(!session){
        return <div>Авторизируйтесь</div>
    }
    return <ProfilePage session={session} />
}