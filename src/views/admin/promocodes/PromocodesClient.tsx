'use client';

import { useState } from 'react';
import { useAdminPromocodes, useCreatePromocode, useUpdatePromocode, useDeletePromocode } from '@/entities/admin/hooks/useAdminPromocodes';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const promoSchema = z.object({
  code: z.string().min(1, 'Обязательное поле'),
  discount: z.coerce.number().min(1, 'Минимум 1%').max(100, 'Максимум 100%'),
  maxUses: z.coerce.number().min(1, 'Минимум 1'),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional()
});

type PromoFormData = z.infer<typeof promoSchema>;

export function PromocodesClient({ initialData }: { initialData: any[] }) {
  const { data: promocodes } = useAdminPromocodes(initialData);
  const createPromo = useCreatePromocode();
  const updatePromo = useUpdatePromocode();
  const deletePromo = useDeletePromocode();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(promoSchema),
    defaultValues: { isActive: true, maxUses: 150, discount: 5 }
  });

  const openCreateModal = () => {
    reset({ isActive: true, maxUses: 150, discount: 5, code: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: any) => {
    reset({
      code: promo.code,
      discount: promo.discount,
      maxUses: promo.maxUses,
      isActive: promo.isActive,
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingId(promo.id);
    setIsModalOpen(true);
  };

  const onSubmit = (data: PromoFormData) => {
    const payload = {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null
    };

    if (editingId) {
      updatePromo.mutate({ id: editingId, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createPromo.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить этот промокод?')) {
      deletePromo.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Промокоды</h1>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Новый промокод
        </button>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium">Код</th>
                <th className="px-6 py-4 font-medium">Скидка</th>
                <th className="px-6 py-4 font-medium">Использовано</th>
                <th className="px-6 py-4 font-medium">Лимит</th>
                <th className="px-6 py-4 font-medium">Срок действия</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {promocodes?.map((promo: any) => (
                <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white tracking-wider">{promo.code}</td>
                  <td className="px-6 py-4 text-green-500 font-medium">{promo.discount}%</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{promo.usesCount}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{promo.maxUses}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Бессрочно'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      promo.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {promo.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEditModal(promo)} className="text-[#A1A1AA] hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(promo.id)} className="text-[#A1A1AA] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {promocodes?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Нет промокодов.
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
              <h2 className="text-xl font-bold">{editingId ? 'Редактировать промокод' : 'Новый промокод'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Код</label>
                <input {...register('code')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white uppercase" />
                {errors.code && <p className="text-red-500 text-xs">{String(errors.code.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Скидка (%)</label>
                <input type="number" {...register('discount')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                {errors.discount && <p className="text-red-500 text-xs">{String(errors.discount.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Лимит использований</label>
                <input type="number" {...register('maxUses')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                {errors.maxUses && <p className="text-red-500 text-xs">{String(errors.maxUses.message)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Действует до (необязательно)</label>
                <input type="datetime-local" {...register('expiresAt')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 rounded bg-[#1F1F1F] border-[#333] text-blue-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-white">Активный</label>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-white bg-[#1F1F1F] hover:bg-[#333] transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={createPromo.isPending || updatePromo.isPending} className="px-4 py-2 rounded-lg font-medium text-sm text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors">
                  {editingId ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
