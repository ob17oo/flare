import { authOptions } from "@/shared/lib/auth"
import { ProfileTicketsPage } from "@/views"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ProfileTickets() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  return <ProfileTicketsPage />
}
