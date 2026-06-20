interface BalanceComponentProps {
    balance: number | undefined,
}
export function BalanceComponent({ balance }: BalanceComponentProps){
    if( balance === undefined){
        return null
    }
    return (
        <div className="flex items-center gap-3 bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] rounded-xl h-full px-4 py-2 transition-all duration-300">
            <span className="text-[14px] font-medium text-[var(--text-secondary)]">Баланс</span>
            <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px] text-[var(--text-primary)]">{balance}</span>
                <span className="text-[15px] text-[var(--accent)] font-bold">₽</span>
            </div>
        </div>
    )
}