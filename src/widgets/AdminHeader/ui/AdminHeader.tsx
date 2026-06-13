'use client';

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminHeader = ({ onOpenSidebar, isCollapsed, onToggleCollapse }: AdminHeaderProps) => {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Toggle mobile sidebar */}
        <button 
          onClick={onOpenSidebar} 
          className="lg:hidden p-1.5 rounded-lg border border-[#1F1F1F] hover:bg-white/5 text-[#A1A1AA] hover:text-white cursor-pointer min-h-9 min-w-9 flex items-center justify-center"
          type="button"
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Toggle desktop collapse */}
        <button 
          onClick={onToggleCollapse} 
          className="hidden lg:flex p-1.5 rounded-lg border border-[#1F1F1F] hover:bg-white/5 text-[#A1A1AA] hover:text-white cursor-pointer min-h-9 min-w-9 items-center justify-center transition-colors"
          type="button"
          title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <h2 className="text-white font-medium text-xs sm:text-sm">Панель Управления</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user.login || session.user.email}</p>
              <p className="text-xs text-[#A1A1AA]">{session.user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1F1F1F]">
              <Image 
                src={session.user.image_url || "/static/default/default-user.svg"} 
                alt="Аватар Администратора" 
                width={36} 
                height={36} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
