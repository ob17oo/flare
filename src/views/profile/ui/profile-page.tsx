'use client'
import { ButtonComponent, InputComponent } from "@/shared/components"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"

import Image from "next/image"

interface ProfileProps {
    session: Session
}
export function ProfilePage({session}: ProfileProps){
    const { user } = session
    return (
        <section className="grid grid-cols-[calc(25%-12px)_calc(75%-12px)] gap-6 mt-6">
            <div className="border border-accent rounded-3xl flex flex-col items-center gap-4 p-3">
                <div className=" w-full max-w-87.5 aspect-square relative overflow-hidden">
                    <Image className=" object-contain" fill src={user.image_url} alt={`User Image ${user.login}`}/>
                </div>
                <div>
                    <div>
                        <span className="text-h5 opacity-50 font-semibold">Логин</span>
                        <p className="text-bold text-h4">{user.login}</p>
                    </div>
                    <div>
                        <span className="text-h5 opacity-50 font-semibold">Эл.почта</span>
                        <p className="text-bold text-h4">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-3 itemsc-center">
                    <ButtonComponent isFilled={true} color="secondary">Редактировать</ButtonComponent>
                    <ButtonComponent onClick={() => signOut()} isFilled={true} color="accent">Выйти</ButtonComponent>
                </div>
            </div>
            <div className="border border-accent rounded-3xl flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <span className="text-h5 opacity-50 font-semibold">Ваш баланс</span>
                    <div className="flex items-center gap-3">
                        <p className="text-bold text-h4 bg-secondary rounded-2xl py-2.5 px-3.5">{user.balance} руб</p>
                        <ButtonComponent color="green-400">Пополнить</ButtonComponent>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-h5 opacity-50 font-semibold">Ваша скидка</span>
                    <div className="flex flex-col">
                        <div className={`w-full h-12.5 rounded-2xl bg-secondary`}>
                            <div className="h-12.5 bg-accent rounded-2xl transition-transform duration-300 ease-in-out" style={ { width: `${Math.min((user.discount / user.maxUserDiscount) * 100, 100)}%` } }></div>
                        </div>
                        <p className="text-h4">{user.discount}% / {user.maxUserDiscount}%</p>
                    </div>
                </div>
                <div className="grid grid-cols-[calc(50%-12px)_calc(50%-12px)] gap-6">
                    <div className="border border-accent rounded-2xl p-3 flex flex-col gap-3">
                        <span className="text-h4">Cтатистика аккаунта</span>
                        <div className="flex flex-col gap-1">  
                            <span className="opacity-50 text-h5 font-semibold">Потраченное рублей</span>
                            <p className="text-[24px] text-accent">{user.spent} рублей</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-h5 opacity-50 font-semibold">Совершенно заказов</span>
                            <p className="text-[24px] text-accent">Будущее кол-во товаров</p>
                        </div>
                    </div>
                    <div className="border border-accent rounded-2xl p-3 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-h4">Блок с поддержкой авторов Flare</h2>
                            <button className="flex items-center justify-center w-5 h-5 rounded-full bg-accent" type="button">?</button>
                        </div>

                        <div className="flex items-center gap-3">
                            <InputComponent sizeVariant="default" placeholder="Ник автора"/>
                            <ButtonComponent isFilled={true} color="secondary">Поддержать</ButtonComponent>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}