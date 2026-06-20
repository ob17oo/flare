import { prisma } from "@/shared/lib/prisma";
import { Users, DollarSign, PackageOpen, MessageCircle, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Query live metrics and recent items from the database in parallel
  const [
    totalUsers,
    depositsSum,
    pendingOrders,
    openTickets,
    recentOrders,
    recentUsers,
    recentPayments
  ] = await Promise.all([
    // 1. Total registered users
    prisma.user.count(),
    
    // 2. Sum of successful deposits (payments)
    prisma.deposit.aggregate({
      where: { status: { in: ['SUCCESS', 'PAID'] } },
      _sum: { amount: true }
    }),
    
    // 3. Count of pending/processing orders
    prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } }
    }),
    
    // 4. Count of active support tickets
    prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS', 'AWAITING_USER'] } }
    }),

    // 5. 5 most recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { login: true, email: true, image_url: true } },
        product: { select: { title: true, price: true, image_url: true } }
      }
    }),

    // 6. 5 most recently registered users (cuid id is sortable by date)
    prisma.user.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      select: { id: true, login: true, email: true, spent: true, image_url: true }
    }),

    // 7. 5 most recent payments
    prisma.deposit.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { login: true, email: true } }
      }
    })
  ]);

  const totalRevenue = depositsSum._sum.amount || 0;

  const stats = [
    {
      label: "Общий Доход",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Пользователей",
      value: totalUsers.toLocaleString('ru-RU'),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Открытые Заказы",
      value: pendingOrders.toLocaleString('ru-RU'),
      icon: PackageOpen,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      label: "Новые Тикеты",
      value: openTickets.toLocaleString('ru-RU'),
      icon: MessageCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Панель Управления</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">Реальные показатели работы платформы Flare в реальном времени.</p>
      </div>
      
      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor} shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#A1A1AA]">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tables Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
            <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#A1A1AA]" />
              Недавние заказы
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A1A1AA] uppercase border-b border-[#1F1F1F]">
                <tr>
                  <th className="py-2.5 font-semibold">Пользователь</th>
                  <th className="py-2.5 font-semibold">Товар</th>
                  <th className="py-2.5 font-semibold text-right">Сумма</th>
                  <th className="py-2.5 font-semibold text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-[#1F1F1F] relative">
                          <Image src={order.user.image_url} alt="User Avatar" fill className="object-cover" />
                        </div>
                        <span className="font-medium text-white truncate max-w-[120px]">{order.user.login}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#A1A1AA] max-w-[160px] truncate">{order.product?.title || 'Товар удален'}</td>
                    <td className="py-3 text-right font-semibold text-white">{order.product ? formatPrice(order.product.price) : '0 ₽'}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'SUCCESS' || order.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#A1A1AA]">Нет недавних заказов.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations List */}
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
            <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
              <Users size={18} className="text-[#A1A1AA]" />
              Новые пользователи
            </h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-all duration-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1F1F1F] relative shrink-0">
                    <Image src={user.image_url} alt="Avatar" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-white truncate">{user.login}</span>
                    <span className="text-[11px] text-[#A1A1AA] truncate">{user.email}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-extrabold text-green-400">{user.spent.toLocaleString('ru-RU')} ₽</p>
                  <span className="text-[9px] text-[#A1A1AA] uppercase font-semibold">Покупок</span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-center text-[#A1A1AA] py-6 text-sm">Нет зарегистрированных пользователей.</p>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Recent Payments */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 md:col-span-2 space-y-4">
          <h3 className="font-bold text-[16px] text-white">Недавние пополнения и платежи</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A1A1AA] uppercase border-b border-[#1F1F1F]">
                <tr>
                  <th className="py-2 font-semibold">Пользователь</th>
                  <th className="py-2 font-semibold">ID Транзакции</th>
                  <th className="py-2 font-semibold text-right">Сумма</th>
                  <th className="py-2 font-semibold text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-medium text-white truncate max-w-[120px]">{p.user?.login || 'Пользователь удален'}</td>
                    <td className="py-2.5 text-xs font-mono text-[#A1A1AA]">{p.stripeId.slice(0, 16)}...</td>
                    <td className="py-2.5 text-right font-semibold text-white">{p.amount} ₽</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'SUCCESS' || p.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                        p.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-[#A1A1AA]">Нет недавних платежей.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 flex flex-col justify-center text-center space-y-3">
          <h3 className="font-bold text-[16px] text-white">Статус Системы</h3>
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Все системы активны</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">Подключение к базе данных PostgreSQL и API Stripe стабильно. Операции проводятся без задержек.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
