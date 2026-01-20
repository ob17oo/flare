import { Crown, Flame, Gem, MessageCircle, ShieldUser, Zap } from "lucide-react";

export function AdvantagesComponent(){
    return (
        <div className="w-full p-3 flex flex-col gap-3 my-20">
            <h1 className="text-2xl font-bold text-center">
                 <span className="text-2xl font-bold text-accent">FLARE </span>
                гарантирует
            </h1>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-secondary p-6 rounded-2xl flex flex-col gap-3 items-center transition-all duration-300 ease-in-out hover:scale-105">
                    <div className="flex justify-center items-center w-13 h-13 rounded-xl bg-accent">
                        <Gem size={36} color="white"/>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <h3 className="text-xl">Выгода</h3>
                        <p className="text-sm text-center opacity-80">Минимальная наценка на товар от нашего сервиса</p>
                    </div>
                </div>
                <div className="bg-secondary p-6 rounded-2xl flex flex-col gap-3 items-center transition-all duration-300 ease-in-out hover:scale-105">
                    <div className="flex justify-center items-center w-13 h-13 rounded-xl bg-accent">
                        <ShieldUser size={36} color="white"/>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <h3 className="text-xl">Безопасность</h3>
                        <p className="text-sm text-center opacity-80">Сервис гарантирует защиту персональных данных</p>
                    </div>
                </div>
                <div className="bg-secondary p-6 rounded-2xl flex flex-col gap-3 items-center transition-all duration-300 ease-in-out hover:scale-105">
                    <div className="flex justify-center items-center w-13 h-13 rounded-xl bg-accent">
                        <Zap size={36} color="white"/>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <h3 className="text-xl">Скорость</h3>
                        <p className="text-sm text-center opacity-80">Сервис автоматически выдает купленный товар</p>
                    </div>
                </div>
                <div className="bg-secondary p-6 rounded-2xl flex flex-col gap-3 items-center transition-all duration-300 ease-in-out hover:scale-105">
                    <div className="flex justify-center items-center w-13 h-13 rounded-xl bg-accent">
                        <Flame size={36} color="white"/>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <h3 className="text-xl">Акции</h3>
                        <p className="text-sm text-center opacity-80">Огромное кол-во скидок на популярные игры и подписки</p>
                    </div>
                </div>
                <div className="bg-secondary p-6 rounded-2xl flex flex-col gap-3 items-center transition-all duration-300 ease-in-out hover:scale-105">
                    <div className="flex justify-center items-center w-13 h-13 rounded-xl bg-accent">
                        <Crown size={36} color="white"/>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <h3 className="text-xl">Система лояльности</h3>
                        <p className="text-sm text-center opacity-80">Уникальная система лояльности для каждого пользователя</p>
                    </div>
                </div>
                <div className="bg-secondary p-6 rounded-2xl flex flex-col gap-3 items-center transition-all duration-300 ease-in-out hover:scale-105">
                    <div className="flex justify-center items-center w-13 h-13 rounded-xl bg-accent">
                        <MessageCircle size={36} color="white"/>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <h3 className="text-xl">Отзывчивая поддержка</h3>
                        <p className="text-sm text-center opacity-80">Отзывчивая поддержка готовая идти на компромиссы</p>
                    </div>
                </div>
            </div>
        </div>
    )
}