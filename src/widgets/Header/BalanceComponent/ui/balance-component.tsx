import Image from "next/image";

interface BalanceComponentProps {
    balance: number | undefined,
}
export function BalanceComponent({ balance }: BalanceComponentProps){
    if( balance === undefined){
        return 
    }
    return (
        <div className="flex items-center gap-3 border-2 border-accent rounded-2xl h-full px-3">
            <div className="flex items-center gap-3">
                <p className="text-h4">{balance}</p>
                <div className="flex items-center justify-center w-8 h-8 bg-accent rounded-full">
                    <Image width={24} height={24} src={'/static/icons/ruble.svg'} alt="HeaderRubleIcon" />
                </div>
            </div>
        </div>
    )
}