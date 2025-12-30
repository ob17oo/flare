'use client'
import { Session } from "next-auth"
import { signOut } from 'next-auth/react'

interface ProfileProps {
    session: Session | null
}
export function ProfilePage({session}: ProfileProps){
    return (
        <section>
            <p>Profile Page</p>
            <p>{session?.user.login}</p>
            <button onClick={() => signOut({callbackUrl: '/'})}>Выйти</button>
        </section>
    )
}