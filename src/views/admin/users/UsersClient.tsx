'use client';

import { useState } from 'react';
import { useAdminUsers, useUpdateUser } from '@/entities/admin/hooks/useAdminUsers';
import { formatPrice } from '@/shared/lib/utils';
import Image from 'next/image';
import { Edit2, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
  balance: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
  isBanned: z.boolean().default(false)
});

type UserFormData = z.infer<typeof userSchema>;

export function UsersClient({ initialData }: { initialData: any[] }) {
  const { data: users } = useAdminUsers(initialData);
  const updateUser = useUpdateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(userSchema)
  });

  const openEditModal = (user: any) => {
    reset({
      role: user.role,
      balance: user.balance,
      discount: user.discount,
      isBanned: user.isBanned
    });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    if (editingId) {
      updateUser.mutate({ id: editingId, data }, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium">Пользователь</th>
                <th className="px-6 py-4 font-medium">Роль</th>
                <th className="px-6 py-4 font-medium">Баланс</th>
                <th className="px-6 py-4 font-medium">Потрачено</th>
                <th className="px-6 py-4 font-medium">Скидка</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1F1F1F]">
                        <Image 
                          src={user.image_url} 
                          alt={user.login} 
                          width={32} 
                          height={32} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.login}</p>
                        <p className="text-xs text-[#A1A1AA]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                      user.role === 'MODERATOR' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-[#1F1F1F] text-[#A1A1AA]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{formatPrice(user.balance)}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{formatPrice(user.spent)}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{user.discount}%</td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500"><ShieldAlert className="w-3 h-3"/> Забанен</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-500"><ShieldCheck className="w-3 h-3"/> Активен</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEditModal(user)} className="text-[#A1A1AA] hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Нет пользователей.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F]">
              <h2 className="text-xl font-bold">Управление пользователем</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Роль</label>
                <select {...register('role')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white">
                  <option value="USER">Пользователь</option>
                  <option value="MODERATOR">Модератор</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Баланс (₽)</label>
                <input type="number" {...register('balance')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Скидка (%)</label>
                <input type="number" {...register('discount')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isBanned" {...register('isBanned')} className="w-4 h-4 rounded bg-[#1F1F1F] border-[#333] text-red-500" />
                <label htmlFor="isBanned" className="text-sm font-medium text-white">Заблокировать (Бан)</label>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-white bg-[#1F1F1F] hover:bg-[#333] transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={updateUser.isPending} className="px-4 py-2 rounded-lg font-medium text-sm text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
