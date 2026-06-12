'use client';

import { useSession } from "next-auth/react";
import Image from "next/image";

export const AdminHeader = () => {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-white font-medium text-sm">Панель Управления</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
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
