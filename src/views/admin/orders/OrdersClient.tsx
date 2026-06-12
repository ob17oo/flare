'use client';

import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus, useDeleteOrder } from '@/entities/admin/hooks/useAdminOrders';
import Image from 'next/image';
import { formatPrice } from '@/shared/lib/utils';
import { Edit2, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function OrdersClient({ initialData }: { initialData: any[] }) {
  const { data: orders } = useAdminOrders(initialData);
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);

  const { register, handleSubmit, reset } = useForm<{ status: string }>();

  const openEditModal = (order: any) => {
    setEditingOrder(order);
    reset({ status: order.status });
    setIsModalOpen(true);
  };

  const onSubmit = (data: { status: string }) => {
    if (editingOrder) {
      updateStatus.mutate({ id: editingOrder.id, status: data.status }, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить этот заказ навсегда?')) {
      deleteOrder.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium">ID Заказа</th>
                <th className="px-6 py-4 font-medium">Пользователь</th>
                <th className="px-6 py-4 font-medium">Товар</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium">Дата</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-[#A1A1AA]">{String(order.id).slice(-8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1F1F1F]">
                        <Image 
                          src={order.user.image_url} 
                          alt={order.user.login} 
                          width={32} 
                          height={32} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{order.user.login}</p>
                        <p className="text-xs text-[#A1A1AA]">{order.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.product ? (
                        <>
                          <div className="w-8 h-8 rounded overflow-hidden bg-[#1F1F1F]">
                            <Image 
                              src={order.product.image_url} 
                              alt={order.product.title} 
                              width={32} 
                              height={32} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-white truncate max-w-[150px]">{order.product.title}</p>
                            <p className="text-xs text-[#A1A1AA]">{formatPrice(order.product.price)}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-[#A1A1AA]">Товар удален</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' :
                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEditModal(order)} className="text-[#A1A1AA] hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="text-[#A1A1AA] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Нет заказов.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F]">
              <h2 className="text-xl font-bold">Изменить статус заказа</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Новый статус</label>
                <select {...register('status')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white">
                  <option value="PENDING">Ожидание</option>
                  <option value="PROCESSING">В обработке</option>
                  <option value="COMPLETED">Завершен</option>
                  <option value="CANCELLED">Отменен</option>
                  <option value="REFUNDED">Возврат</option>
                </select>
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
