import { prisma } from "@/shared/lib/prisma";
import { Users, DollarSign, PackageOpen, MessageCircle } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    totalUsers,
    deposits,
    pendingOrders,
    openTickets
  ] = await Promise.all([
    prisma.user.count(),
    prisma.deposit.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    }),
    prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } }
    }),
    prisma.supportTicket.count({
      where: { status: 'OPEN' }
    })
  ]);

  const totalRevenue = deposits._sum.amount || 0;

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#A1A1AA]">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Недавняя активность</h3>
          <p className="text-sm text-[#A1A1AA]">Дополнительные графики появятся здесь позже.</p>
        </div>
        <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Статус Системы</h3>
          <p className="text-sm text-[#A1A1AA]">Все системы работают в штатном режиме.</p>
        </div>
      </div>
    </div>
  );
}
