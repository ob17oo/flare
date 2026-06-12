'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InputComponent } from '@/shared/components';
import { Search, Link as LinkIcon, Users, CheckCircle, ArrowRight } from 'lucide-react';

export const ReferralsClient = () => {
  const [search, setSearch] = useState('');

  const { data: referrers = [], isLoading } = useQuery({
    queryKey: ['admin-referrals', search],
    queryFn: async () => {
      const res = await fetch(`/api/admin/referrals?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to fetch referrals');
      return res.json();
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] p-8 max-w-[1200px] mx-auto w-full gap-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Рефералы</h1>
          <p className="text-[#A1A1AA] mt-2">Управление реферальной программой и статистика пользователей</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4 flex gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Поиск по логину, почте или коду..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#333333] transition-colors"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F1F1F] bg-[#0A0A0A]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Реферальный код</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Всего приглашено</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Активных (С покупкой)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#A1A1AA] text-sm">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-[#A1A1AA] border-t-transparent rounded-full animate-spin" />
                      Загрузка...
                    </div>
                  </td>
                </tr>
              ) : referrers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#A1A1AA] text-sm">
                    Рефералы не найдены
                  </td>
                </tr>
              ) : (
                referrers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-[#1A1A1A] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user.login}</span>
                        <span className="text-xs text-[#A1A1AA] mt-0.5">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-sm text-white font-mono">{user.referralCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#A1A1AA]" />
                        <span className="text-sm font-medium text-white">{user.totalReferrals}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                        <span className="text-sm font-bold text-[var(--success)]">{user.activeReferrals}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
