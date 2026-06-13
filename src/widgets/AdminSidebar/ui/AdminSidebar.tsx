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
  X,
  Link as LinkIcon,
  Megaphone
} from 'lucide-react';

const navItems = [
  { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Пользователи', href: '/admin/users', icon: Users },
  { name: 'Платежи', href: '/admin/payments', icon: CreditCard },
  { name: 'Тикеты', href: '/admin/support', icon: MessageSquare },
  { name: 'Промокоды', href: '/admin/promocodes', icon: Tag },
  { name: 'Маркетинг', href: '/admin/marketing', icon: Megaphone },
  { name: 'Рефералы', href: '/admin/referrals', icon: LinkIcon },
  { name: 'Логи', href: '/admin/audit', icon: FileText },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar = ({ isOpen, onClose, isCollapsed }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "bg-[#0A0A0A] border-r border-[#1F1F1F] h-screen flex flex-col sticky top-0 transition-all duration-300 z-40",
      isCollapsed ? "w-20" : "w-64",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      "fixed lg:static inset-y-0 left-0"
    )}>
      {/* Mobile Drawer Close Button */}
      <div className="lg:hidden absolute top-4 right-4">
        <button onClick={onClose} className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer" type="button" aria-label="Закрыть меню">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className={cn("p-6 flex items-center justify-between", isCollapsed ? "justify-center px-4" : "")}>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#1F1F1F] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          {!isCollapsed && <span className="text-white font-semibold text-lg tracking-wide whitespace-nowrap animate-fade-in">Панель Flare</span>}
        </Link>
      </div>

      <nav className={cn("flex-1 px-4 py-4 space-y-1 overflow-y-auto", isCollapsed ? "px-2" : "")}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#A1A1AA]")} />
              {!isCollapsed && <span className="animate-fade-in">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F1F1F]">
        <Link
          href="/"
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-colors",
            isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          )}
          title={isCollapsed ? "Вернуться в магазин" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="animate-fade-in">Вернуться в магазин</span>}
        </Link>
      </div>
    </aside>
  );
};
