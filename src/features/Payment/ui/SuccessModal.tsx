import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLockScroll } from "@/shared/hooks"

interface SuccessModalProps {
    showModal: boolean,
    setShowModal: (value: boolean) => void,
    successMsg?: string
}
export function SuccessModal({showModal, setShowModal, successMsg}: SuccessModalProps){
    const router = useRouter()
    useLockScroll({ isOpen: showModal })
    if(!showModal){
        return null
    }
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-4 shadow-[var(--modal-shadow)]" onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20 shadow-inner">
                    <Check size={26} strokeWidth={2.5}/>
                </div>
                <div className="text-center flex flex-col gap-2">
                    <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Заказ успешно создан</h3>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        {successMsg || "На указанную вами электронную почту в ближайшее время будет отправлен код активации и инструкции."}
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3 w-full mt-2">
                    <button 
                        onClick={() => { setShowModal(false); router.push('/profile'); }} 
                        className="flex-1 h-11 flex items-center justify-center border border-[var(--border-muted)] hover:bg-[var(--bg-layer-3)] text-[var(--text-primary)] font-semibold text-[13px] rounded-xl cursor-pointer transition-colors duration-200" 
                        type="button"
                    >
                        Мои заказы
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