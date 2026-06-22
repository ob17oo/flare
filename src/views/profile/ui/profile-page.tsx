'use client'

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { copyToClipboard } from "@/shared/lib/utils"
import { ButtonComponent, InputComponent, ErrorMessage } from "@/shared/components"
import { useLockScroll } from "@/shared/hooks"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  AlertCircle, 
  ChevronRight,
  Users,
  Copy,
  Check,
  Package,
  X
} from "lucide-react"

interface ProfileProps {
  session: Session
}

interface TProfileOrder {
  id: number
  status: string
  createdAt: string
  product: {
    title: string
    image_url: string
    price: number
  } | null
  ticket: {
    productKey: string
  } | null
}

interface TProfileTicket {
  id: string
  subject: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
}

const CATEGORY_MAP: Record<string, string> = {
  PAYMENT: 'Оплата',
  ORDER: 'Заказ',
  BALANCE: 'Баланс',
  REFUND: 'Возврат',
  BUG: 'Ошибка',
  ACCOUNT: 'Аккаунт',
  OTHER: 'Другое'
}

const STATUS_MAP: Record<string, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  AWAITING_USER: 'Ожидает ответа',
  RESOLVED: 'Решен',
  CLOSED: 'Закрыт'
}

export function ProfilePage({ session }: ProfileProps) {
  const router = useRouter()
  const { user } = session
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'support' | 'referrals'>('dashboard')
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ login: user.login, email: user.email, password: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [visibleOrders, setVisibleOrders] = useState(5)
  const [refCodeInput, setRefCodeInput] = useState('')
  const [isApplyingRef, setIsApplyingRef] = useState(false)
  const [refApplyStatus, setRefApplyStatus] = useState<{success?: boolean, message?: string} | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null)

  useLockScroll({ isOpen: isEditing })

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<TProfileOrder[]>({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const res = await fetch('/api/profile/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    enabled: activeTab === 'dashboard' || activeTab === 'orders'
  })

  // Fetch tickets for support tab
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<TProfileTicket[]>({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await fetch('/api/support/tickets')
      if (!res.ok) throw new Error('Failed to fetch tickets')
      return res.json()
    },
    enabled: activeTab === 'support'
  })

  // Fetch referrals data
  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ['user-referrals'],
    queryFn: async () => {
      const res = await fetch('/api/profile/referrals')
      if (!res.ok) throw new Error('Failed to fetch referrals')
      return res.json()
    },
    enabled: activeTab === 'referrals'
  })

  const handleCopyRef = async () => {
    if (!referralsData?.referralCode) return;
    const link = `${window.location.origin}/register?ref=${referralsData.referralCode}`;
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    // Basic client-side validation
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      setEditError('Введите корректный адрес электронной почты');
      return;
    }

    if (editForm.password && editForm.password.length < 8) {
      setEditError('Пароль должен содержать не менее 8 символов');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
        // Force session refresh by reloading page
        window.location.reload();
      } else {
        setEditError(data.error || 'Не удалось обновить профиль');
      }
    } catch (error) {
      console.error(error);
      setEditError('Произошла ошибка при обновлении профиля');
    } finally {
      setIsSaving(false);
    }
  }

  const handleApplyRefCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCodeInput.trim()) return;
    setIsApplyingRef(true);
    setRefApplyStatus(null);
    try {
      const res = await fetch('/api/profile/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: refCodeInput })
      });
      const data = await res.json();
      if (res.ok) {
        setRefApplyStatus({ success: true, message: data.message });
        setRefCodeInput('');
        // Refresh referrals data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setRefApplyStatus({ success: false, message: data.error || 'Ошибка применения кода' });
      }
    } catch {
      setRefApplyStatus({ success: false, message: 'Произошла ошибка' });
    } finally {
      setIsApplyingRef(false);
    }
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mt-6 py-4">
      {/* Sidebar Profile Card */}
      <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl flex flex-col items-center gap-6 p-6 shadow-[var(--card-shadow)] h-fit">
        <div className="w-24 h-24 rounded-full border-2 border-[var(--border-muted)] relative overflow-hidden bg-[var(--bg-layer-0)]">
          <Image className="object-cover" fill src={user.image_url} alt={`User Image ${user.login}`} />
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

        {/* Navigation Tabs */}
        <div className="w-full border-t border-[var(--border-muted)]/60 pt-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-hide gap-1.5 pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-auto shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150 ease-in-out cursor-pointer border ${
              activeTab === 'dashboard'
                ? 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-layer-2)]/40'
            }`}
          >
            <LayoutDashboard size={16} />
            Главная панель
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-auto shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150 ease-in-out cursor-pointer border ${
              activeTab === 'support'
                ? 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-layer-2)]/40'
            }`}
          >
            <LifeBuoy size={16} />
            Мои тикеты
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-auto shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150 ease-in-out cursor-pointer border ${
              activeTab === 'orders'
                ? 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-layer-2)]/40'
            }`}
          >
            <Package size={16} />
            Мои покупки
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`w-auto shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-150 ease-in-out cursor-pointer border ${
              activeTab === 'referrals'
                ? 'bg-[var(--bg-layer-2)] border-[var(--border-muted)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-layer-2)]/40'
            }`}
          >
            <Users size={16} />
            Реферальная программа
          </button>
        </div>

        <div className="flex flex-row md:flex-col gap-2 w-full mt-2 border-t border-[var(--border-muted)]/60 pt-4">
          <ButtonComponent onClick={() => { setIsEditing(true); setEditError(null); }} isFilled={true} color="secondary" className="w-full py-2.5">Редактировать</ButtonComponent>
          <ButtonComponent onClick={() => signOut()} isFilled={true} color="accent" className="w-full py-2.5">Выйти</ButtonComponent>
        </div>
      </div>

      {/* Main Panel Content */}
      {activeTab === 'dashboard' ? (
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl flex flex-col gap-6 p-6 shadow-[var(--card-shadow)] h-fit">
          {/* Balance Block */}
          <div className="flex flex-col gap-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваш текущий баланс</span>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[20px] font-extrabold text-[var(--text-primary)]">{user.balance.toLocaleString('ru-RU')} ₽</p>
              <ButtonComponent onClick={() => router.push('/balance/topup')} color="success" isFilled={true} className="py-2 px-5">Пополнить баланс</ButtonComponent>
            </div>
          </div>

          {/* Discount Progress Block */}
          <div className="flex flex-col gap-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваша персональная скидка</span>
            <div className="flex flex-col mt-2">
              <div className="w-full h-2.5 rounded-full bg-[var(--bg-layer-0)] border border-[var(--border-muted)] relative overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${Math.min((user.discount / user.maxUserDiscount) * 100, 100)}%` }}></div>
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
              <div className="flex flex-col gap-0.5 border-b border-[var(--border-muted)] pb-2 mb-2">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Всего потрачено</span>
                <p className="text-[20px] font-extrabold text-[var(--accent)]">{user.spent.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>

            {/* Support Creator -> Referral Code */}
            <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl p-5 flex flex-col gap-4 justify-between">
              <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Активация реферала</h3>
                <button className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] transition-colors cursor-pointer" type="button" title="Введите код или ссылку пригласившего вас человека, чтобы стать его рефералом">?</button>
              </div>

              <div className="flex flex-col gap-3 flex-1 justify-center">
                {referralsData?.hasReferrer ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
                    <Check size={24} className="text-[var(--success)]" />
                    <span className="text-[13px] font-semibold text-[var(--success)]">Вы уже активировали код</span>
                  </div>
                ) : (
                  <form onSubmit={handleApplyRefCode} className="flex flex-col gap-3">
                    <InputComponent 
                      sizeVariant="default" 
                      placeholder="Реферальный код или ссылка" 
                      value={refCodeInput}
                      onChange={(e) => setRefCodeInput(e.target.value)}
                    />
                    {refApplyStatus && (
                      <span className={`text-[11px] font-bold ${refApplyStatus.success ? 'text-[var(--success)]' : 'text-red-500'}`}>
                        {refApplyStatus.message}
                      </span>
                    )}
                    <ButtonComponent type="submit" disabled={isApplyingRef} isFilled={true} color="accent" className="w-full py-2.5">
                      {isApplyingRef ? 'Активация...' : 'Активировать код'}
                    </ButtonComponent>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'referrals' ? (
        // Referrals Tab
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-6 h-fit">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)]/60 pb-3">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users size={16} className="text-[var(--accent)]" />
              Реферальная программа
            </h2>
          </div>

          {referralsLoading ? (
            <div className="py-10 text-center">
              <span className="text-[12px] text-[var(--text-secondary)]">Загрузка данных...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Copy Link Section */}
              <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl flex flex-col gap-3">
                <span className="text-[13px] font-bold text-[var(--text-primary)]">Ваша реферальная ссылка</span>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  Приглашайте друзей и получайте скидку до 20% на все товары маркетплейса. Скидка растет за каждого друга, совершившего хотя бы одну покупку.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
                  <div className="flex-1 bg-[var(--bg-layer-0)] border border-[var(--border-muted)] rounded-lg px-4 py-2.5 flex items-center overflow-hidden">
                    <span className="text-[13px] text-[var(--text-primary)] font-mono truncate">
                      {window.location.origin}/register?ref={referralsData?.referralCode}
                    </span>
                  </div>
                  <ButtonComponent 
                    onClick={handleCopyRef} 
                    color="accent" 
                    isFilled 
                    className="flex items-center justify-center gap-2 py-2.5 px-6 shrink-0 w-full sm:w-auto"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Скопировано' : 'Скопировать'}
                  </ButtonComponent>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваша скидка</span>
                  <span className="text-[24px] font-extrabold text-[var(--accent)]">{referralsData?.discount}%</span>
                </div>
                <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Всего приглашено</span>
                  <span className="text-[24px] font-extrabold text-[var(--text-primary)]">{referralsData?.totalReferrals || 0}</span>
                </div>
                <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Активных (с покупкой)</span>
                  <span className="text-[24px] font-extrabold text-[var(--success)]">{referralsData?.activeReferrals || 0}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">Уровни скидок</span>
                  {referralsData?.nextThreshold ? (
                    <span className="text-[12px] text-[var(--text-secondary)]">
                      Еще <strong className="text-[var(--text-primary)]">{referralsData.nextThreshold - (referralsData.activeReferrals || 0)}</strong> активных рефералов до скидки {referralsData.nextDiscount}%
                    </span>
                  ) : (
                    <span className="text-[12px] text-[var(--success)] font-bold">
                      Максимальный уровень достигнут!
                    </span>
                  )}
                </div>
                
                <div className="relative w-full h-3 bg-[var(--bg-layer-0)] rounded-full border border-[var(--border-muted)] overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(((referralsData?.activeReferrals || 0) / 20) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 xs:grid-cols-3 md:flex md:justify-between gap-y-2 gap-x-4 text-[10px] font-bold text-[var(--text-secondary)] mt-2">
                  <span>1 реф (1%)</span>
                  <span>3 реф (3%)</span>
                  <span>5 реф (5%)</span>
                  <span>10 реф (10%)</span>
                  <span>15 реф (15%)</span>
                  <span>20+ реф (20%)</span>
                </div>
              </div>

            </div>
          )}
        </div>
      ) : activeTab === 'orders' ? (
        // Orders Tab
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-6 h-fit">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)]/60 pb-3">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Package size={16} className="text-[var(--text-secondary)]" />
              История покупок
            </h2>
          </div>

          {ordersLoading ? (
            <div className="py-10 text-center">
              <span className="text-[12px] text-[var(--text-secondary)]">Загрузка заказов...</span>
            </div>
          ) : orders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {orders.slice(0, visibleOrders).map((order: TProfileOrder) => (
                <div key={order.id} className="flex flex-col bg-[var(--bg-layer-2)]/30 hover:bg-[var(--bg-layer-2)]/60 border border-[var(--border-muted)] p-4 rounded-xl transition-all duration-200 gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-[var(--bg-layer-0)] border border-[var(--border-muted)] flex-shrink-0 relative overflow-hidden">
                        {order.product?.image_url ? (
                          <Image src={order.product.image_url} alt="Product" fill className="object-cover" />
                        ) : (
                          <Package className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                        <span className="text-[14px] font-bold text-[var(--text-primary)] truncate">{order.product?.title || `Заказ #${String(order.id).slice(-4)}`}</span>
                        <span className="text-[11px] text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString('ru-RU')} в {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1 shrink-0">
                      <span className="text-[16px] font-extrabold text-[var(--text-primary)]">{order.product?.price ?? 0} ₽</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg border ${order.status === 'SUCCESS' || order.status === 'PAID' ? 'bg-green-500/5 text-[var(--success)] border-green-500/10' : 'bg-orange-500/5 text-orange-500 border-orange-500/10'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {order.ticket?.productKey && (order.status === 'SUCCESS' || order.status === 'PAID') && (
                    <div className="pt-3 border-t border-[var(--border-muted)]/60 flex flex-col gap-2">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Лицензионный ключ активации</span>
                      <div className="flex items-center gap-2 bg-[var(--bg-layer-0)] border border-[var(--border-muted)] p-2.5 rounded-xl justify-between group">
                        <code className="text-[13px] font-mono font-bold text-[var(--text-primary)] select-all tracking-wider break-all">{order.ticket.productKey}</code>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const success = await copyToClipboard(order.ticket!.productKey);
                            if (success) {
                              setCopiedKeyId(order.id);
                              setTimeout(() => setCopiedKeyId(null), 2000);
                            }
                          }}
                          className="p-2 rounded-lg bg-[var(--bg-layer-2)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border-muted)] text-[var(--text-secondary)] transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title="Копировать ключ"
                        >
                          {copiedKeyId === order.id ? (
                            <Check size={14} className="text-white" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {visibleOrders < orders.length && (
                <div className="pt-4 flex justify-center border-t border-[var(--border-muted)]/60 mt-2">
                  <ButtonComponent 
                    color="secondary" 
                    isFilled 
                    onClick={() => setVisibleOrders(prev => prev + 5)}
                    className="px-6 py-2 text-[13px]"
                  >
                    Показать еще
                  </ButtonComponent>
                </div>
              )}
            </div>
          ) : (
            <div className="py-14 text-center border border-dashed border-[var(--border-muted)] rounded-xl flex flex-col gap-3 items-center justify-center">
              <Package size={20} className="text-[var(--text-secondary)]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">История покупок пуста</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Здесь будут отображаться ваши заказы</span>
              </div>
              <ButtonComponent
                onClick={() => router.push('/')}
                color="accent"
                isFilled
                className="flex items-center gap-1.5 px-4 py-2 mt-2 text-[12px]"
              >
                Перейти в каталог
              </ButtonComponent>
            </div>
          )}
        </div>
      ) : (
        // Support Tickets List Tab
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-5 h-fit">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)]/60 pb-3">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--text-secondary)]" />
              Мои обращения в поддержку
            </h2>
            {tickets.length > 0 && (
              <ButtonComponent
                onClick={() => router.push('/support')}
                color="accent"
                isFilled
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
              >
                <Plus size={12} />
                Создать тикет
              </ButtonComponent>
            )}
          </div>

          {ticketsLoading ? (
            <div className="py-10 text-center">
              <span className="text-[12px] text-[var(--text-secondary)]">Загрузка обращений...</span>
            </div>
          ) : tickets.length > 0 ? (
            <div className="flex flex-col gap-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/support?ticketId=${t.id}`)}
                  className="flex items-center justify-between bg-[var(--bg-layer-2)]/30 hover:bg-[var(--bg-layer-2)]/60 border border-[var(--border-muted)] px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-[13px]"
                >
                  <div className="flex flex-col gap-1 truncate pr-4">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-[var(--text-primary)] truncate">{t.subject}</span>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] bg-[var(--bg-layer-3)] px-1.5 py-0.5 rounded border border-[var(--border-muted)] shrink-0">
                        {CATEGORY_MAP[t.category]}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                      Создан: {new Date(t.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED'
                        ? 'bg-green-500/5 text-[var(--success)] border-green-500/10'
                        : t.status === 'AWAITING_USER'
                        ? 'bg-orange-500/5 text-orange-500 border-orange-500/10'
                        : 'bg-blue-500/5 text-[var(--accent)] border-blue-500/10'
                    }`}>
                      {STATUS_MAP[t.status]}
                    </span>
                    <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center border border-dashed border-[var(--border-muted)] rounded-xl flex flex-col gap-3 items-center justify-center">
              <AlertCircle size={20} className="text-[var(--text-secondary)]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">История тикетов пуста</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Если у вас возникла техническая проблема, вы можете задать вопрос нашей поддержке</span>
              </div>
              <ButtonComponent
                onClick={() => router.push('/support')}
                color="accent"
                isFilled
                className="flex items-center gap-1.5 px-4 py-2 mt-2 text-[12px]"
              >
                <Plus size={14} />
                Создать обращение
              </ButtonComponent>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 shadow-[var(--card-shadow)]">
            <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-3">
              <h2 className="text-[16px] font-bold text-[var(--text-primary)]">Редактировать профиль</h2>
              <button onClick={() => setIsEditing(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Логин</label>
                <InputComponent 
                  sizeVariant="default"
                  value={editForm.login} 
                  onChange={(e) => setEditForm({...editForm, login: e.target.value})} 
                  placeholder="Ваш логин" 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Email</label>
                <InputComponent 
                  sizeVariant="default"
                  type="email"
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  placeholder="Ваш email" 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Новый пароль (необязательно)</label>
                <InputComponent 
                  sizeVariant="default"
                  type="password"
                  value={editForm.password} 
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                  placeholder="Оставьте пустым, чтобы не менять" 
                />
              </div>
              
              {editError && (
                <ErrorMessage message={editError} className="mt-2" />
              )}
              
              <div className="flex justify-end gap-3 pt-2 mt-2 border-t border-[var(--border-muted)]">
                <ButtonComponent type="button" onClick={() => setIsEditing(false)} color="secondary" className="px-5">Отмена</ButtonComponent>
                <ButtonComponent type="submit" disabled={isSaving} isFilled color="accent" className="px-5">
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </ButtonComponent>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}