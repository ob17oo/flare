'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  CreditCard, 
  Tag,
  FileText,
  LogOut,
  Link as LinkIcon
} from 'lucide-react';

const navItems = [
  { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Пользователи', href: '/admin/users', icon: Users },
  { name: 'Платежи', href: '/admin/payments', icon: CreditCard },
  { name: 'Тикеты', href: '/admin/support', icon: MessageSquare },
  { name: 'Промокоды', href: '/admin/promocodes', icon: Tag },
  { name: 'Рефералы', href: '/admin/referrals', icon: LinkIcon },
  { name: 'Логи', href: '/admin/audit', icon: FileText },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#1F1F1F] flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">Панель Flare</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[#A1A1AA]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F1F1F]">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Вернуться в магазин
        </Link>
      </div>
    </aside>
  );
};
