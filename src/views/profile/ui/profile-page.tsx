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
        <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mt-6 py-4">
            {/* Sidebar Profile Card */}
            <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl flex flex-col items-center gap-6 p-6 shadow-[var(--card-shadow)]">
                <div className="w-24 h-24 rounded-full border-2 border-[var(--border-muted)] relative overflow-hidden bg-[var(--bg-layer-0)]">
                    <Image className="object-cover" fill src={user.image_url} alt={`User Image ${user.login}`}/>
                </div>
                <div className="w-full flex flex-col gap-4">
                    <div>
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Логин</span>
                        <p className="font-bold text-[16px] text-[var(--text-primary)] mt-0.5">{user.login}</p>
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Электронная почта</span>
                        <p className="font-bold text-[14px] text-[var(--text-primary)] mt-0.5 truncate">{user.email}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full mt-2">
                    <ButtonComponent isFilled={true} color="secondary" className="w-full py-2.5">Редактировать</ButtonComponent>
                    <ButtonComponent onClick={() => signOut()} isFilled={true} color="accent" className="w-full py-2.5">Выйти</ButtonComponent>
                </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl flex flex-col gap-6 p-6 shadow-[var(--card-shadow)]">
                {/* Balance Block */}
                <div className="flex flex-col gap-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваш текущий баланс</span>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-[20px] font-extrabold text-[var(--text-primary)]">{user.balance.toLocaleString('ru-RU')} ₽</p>
                        <ButtonComponent color="success" isFilled={true} className="py-2 px-5">Пополнить баланс</ButtonComponent>
                    </div>
                </div>
                
                {/* Discount Progress Block */}
                <div className="flex flex-col gap-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваша персональная скидка</span>
                    <div className="flex flex-col mt-2">
                        <div className="w-full h-2.5 rounded-full bg-[var(--bg-layer-0)] border border-[var(--border-muted)] relative overflow-hidden">
                            <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={ { width: `${Math.min((user.discount / user.maxUserDiscount) * 100, 100)}%` } }></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[12px] text-[var(--text-secondary)]">Текущая скидка</span>
                            <span className="text-[13px] font-bold text-[var(--accent)]">{user.discount}% / {user.maxUserDiscount}%</span>
                        </div>
                    </div>
                </div>
                
                {/* Account Stats & Creator Support Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats */}
                    <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl p-5 flex flex-col gap-4">
                        <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2">Статистика аккаунта</h3>
                        <div className="flex flex-col gap-0.5">  
                            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Всего потрачено</span>
                            <p className="text-[20px] font-extrabold text-[var(--accent)]">{user.spent.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Выполнено заказов</span>
                            <p className="text-[14px] font-bold text-[var(--text-primary)]">История покупок пуста</p>
                        </div>
                    </div>
                    
                    {/* Support Creator */}
                    <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl p-5 flex flex-col gap-4 justify-between">
                        <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                            <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Поддержка авторов</h3>
                            <button className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] transition-colors cursor-pointer" type="button" title="Информация">?</button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <InputComponent sizeVariant="default" placeholder="Никнейм автора"/>
                            <ButtonComponent isFilled={true} color="accent" className="w-full py-2.5">Поддержать автора</ButtonComponent>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}