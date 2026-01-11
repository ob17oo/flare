'use client'
import { Session } from "next-auth"
import { signOut } from 'next-auth/react'
import Image from "next/image"

interface ProfileProps {
    session: Session
}
export function ProfilePage({session}: ProfileProps){
    
    return (
        <section>
            <div className="bg-black w-62.5 h-62.5 rounded-full relative overflow-clip">
                <Image src={session.user.image_url} alt={session?.user.login} className="object-cover" fill/>
            </div>
            <p>Profile Page</p>
            <p>{session?.user.login}</p>
            <button onClick={() => signOut({callbackUrl: '/'})}>Выйти</button>
        </section>
    )
}