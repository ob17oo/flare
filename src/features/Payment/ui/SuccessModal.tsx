import { Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface SuccessModalProps {
    showModal: boolean,
    setShowModal: (value: boolean) => void
}
export function SuccessModal({showModal, setShowModal}: SuccessModalProps){
    const router = useRouter()
    if(!showModal){
        return null
    }
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-secondary rounded-2xl p-8 max-w-md w-full mx-4 border border-accent flex flex-col items-center gap-3">
                <div className="relative overflow-hidden w-12 h-12 rounded-full flex items-center justify-center bg-accent">
                    <Check size={24} color="white"/>
                </div>
                <h3 className="text-xl font-semibold">Заказ успешно создан!</h3>
                <p className="text-sm text-center opacity-50">Заказ успешно сформирован, на почту отправят код активации</p>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/profile')} className="border border-accent rounded-2xl px-4 py-3" type="button">Мои заказы</button>
                    <button onClick={() => setShowModal(false)} className="bg-accent rounded-2xl px-4 py-3" type="button">Закрыть</button>
                </div>
            </div>
        </div>
    )
}