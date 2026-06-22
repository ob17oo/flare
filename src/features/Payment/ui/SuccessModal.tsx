import { Check, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLockScroll } from "@/shared/hooks"
import { useState } from "react"
import { copyToClipboard } from "@/shared/lib/utils"

interface SuccessModalProps {
    showModal: boolean,
    setShowModal: (value: boolean) => void,
    successMsg?: string,
    activationKey?: string | null
}
export function SuccessModal({showModal, setShowModal, successMsg, activationKey}: SuccessModalProps){
    const router = useRouter()
    const [copied, setCopied] = useState(false)
    useLockScroll({ isOpen: showModal })

    if(!showModal){
        return null
    }

    const handleCopy = async () => {
        if (activationKey) {
            const success = await copyToClipboard(activationKey)
            if (success) {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-4 shadow-[var(--modal-shadow)]" onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 shadow-inner">
                    <Check size={26} strokeWidth={2.5}/>
                </div>
                <div className="text-center flex flex-col gap-2">
                    <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Заказ успешно оплачен</h3>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        {successMsg || (activationKey 
                            ? "Поздравляем! Покупка успешно завершена. Ваш лицензионный код активации готов к использованию." 
                            : "Заказ успешно оформлен. Лицензионный ключ готов и доступен в личном кабинете.")}
                    </p>
                </div>

                {activationKey && (
                    <div className="w-full flex flex-col gap-2 mt-2">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-left">Код активации</span>
                        <div className="flex items-center gap-2 bg-[var(--bg-layer-0)] border border-[var(--border-muted)] p-3 rounded-xl justify-between w-full group relative overflow-hidden">
                            {/* Subtle background glow */}
                            <div className="absolute -right-8 -top-8 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-xl pointer-events-none" />
                            <code className="text-[14px] font-mono font-bold text-[var(--text-primary)] select-all tracking-wider break-all z-10">{activationKey}</code>
                            <button
                                onClick={handleCopy}
                                className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 z-10 border ${
                                    copied 
                                        ? 'bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]' 
                                        : 'bg-[var(--bg-layer-2)] hover:bg-[var(--accent)] hover:text-white border-[var(--border-muted)] text-[var(--text-secondary)]'
                                }`}
                                title="Копировать ключ"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] text-center mt-1">
                            Ключ сохранен в профиле в разделе «Мои покупки»
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-3 w-full mt-2">
                    <button 
                        onClick={() => { setShowModal(false); router.push('/profile'); }} 
                        className="flex-1 h-11 flex items-center justify-center border border-[var(--border-muted)] hover:bg-[var(--bg-layer-3)] text-[var(--text-primary)] font-semibold text-[13px] rounded-xl cursor-pointer transition-colors duration-200" 
                        type="button"
                    >
                        Мои покупки
                    </button>
                    <button 
                        onClick={() => setShowModal(false)} 
                        className="flex-1 h-11 flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-[13px] rounded-xl cursor-pointer transition-all duration-200 shadow-sm" 
                        type="button"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    )
}