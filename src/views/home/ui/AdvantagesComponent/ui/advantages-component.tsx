import { ADVATAGES } from "../model/adv.constants";
import Image from "next/image";

export function AdvantagesComponent(){
    return (
        <div className="w-full p-3 flex flex-col gap-6 my-10">
            <h1 className="text-h2 font-bold text-center">
                 <span className="text-h2 font-bold text-accent">FLARE </span>
                гарантирует
            </h1>
            <div className="grid grid-cols-3 gap-6">
                { ADVATAGES.map((adv) => (
                    <div key={adv.title} className="bg-secondary w-full py-20 rounded-2xl flex flex-col items-center justify-center gap-6">
                        <div className="flex justify-center items-center w-20 h-20 rounded-xl bg-accent relative">
                            <Image width={32} height={34} src={adv.imageUrl} alt={adv.title}/>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <h3 className="text-h4 font-semibold">{adv.title}</h3>
                            <p className="text-h5 text-center opacity-80">{adv.description}</p>
                        </div>
                    </div>
                )) }
            </div>
        </div>
    )
}