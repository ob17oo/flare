'use client';

import { useState } from 'react';
import { useAdminPayments, useUpdatePaymentStatus } from '@/entities/admin/hooks/useAdminPayments';
import Image from 'next/image';
import { formatPrice } from '@/shared/lib/utils';
import { Edit2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { getAllPayments } from '@/entities/admin/api/payments.action';
import { STATUS } from '@prisma/client';
import { ErrorMessage } from '@/shared/components';

type PaymentType = Awaited<ReturnType<typeof getAllPayments>>[number];

export function PaymentsClient({ initialData }: { initialData: PaymentType[] }) {
  const { data: payments } = useAdminPayments(initialData);
  const updateStatus = useUpdatePaymentStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(null);

  const { register, handleSubmit, reset } = useForm<{ status: STATUS }>();

  const openEditModal = (payment: PaymentType) => {
    setEditingPayment(payment);
    reset({ status: payment.status });
    setIsModalOpen(true);
  };

  const onSubmit = (data: { status: STATUS }) => {
    if (editingPayment) {
      if (confirm('Изменение статуса платежа может повлиять на баланс пользователя. Продолжить?')) {
        updateStatus.mutate({ id: editingPayment.id, status: data.status }, {
          onSuccess: () => setIsModalOpen(false)
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Платежи (Пополнения)</h1>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium hidden md:table-cell">ID Платежа (Stripe)</th>
                <th className="px-6 py-4 font-medium">Пользователь</th>
                <th className="px-6 py-4 font-medium">Сумма</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Дата</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {payments?.map((payment: PaymentType) => (
                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-[#A1A1AA] truncate max-w-[200px] hidden md:table-cell">{payment.stripeId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1F1F1F]">
                        <Image 
                          src={payment.user.image_url} 
                          alt={payment.user.login} 
                          width={32} 
                          height={32} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{payment.user.login}</p>
                        <p className="text-xs text-[#A1A1AA]">{payment.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{formatPrice(payment.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      payment.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' :
                      payment.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] whitespace-nowrap hidden sm:table-cell">
                    {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <button onClick={() => openEditModal(payment)} className="text-[#A1A1AA] hover:text-white transition-colors w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5" aria-label="Редактировать платеж">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Нет платежей.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F]">
              <h2 className="text-xl font-bold">Изменить статус платежа</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {updateStatus.isError && (
                <ErrorMessage message={updateStatus.error instanceof Error ? updateStatus.error.message : 'Не удалось обновить статус платежа'} />
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Новый статус</label>
                <select {...register('status')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white">
                  <option value="PENDING">Ожидание</option>
                  <option value="SUCCESS">Успешно</option>
                  <option value="FAILED">Ошибка</option>
                </select>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-lg text-sm">
                Внимание: Изменение статуса на Успешно начислит пользователю {formatPrice(editingPayment.amount)}.
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-white bg-[#1F1F1F] hover:bg-[#333] transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={updateStatus.isPending} className="px-4 py-2 rounded-lg font-medium text-sm text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors">
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
