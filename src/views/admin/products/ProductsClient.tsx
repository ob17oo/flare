'use client';

import { useState } from 'react';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/entities/admin/hooks/useAdminProducts';
import { formatPrice } from '@/shared/lib/utils';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Цена должна быть больше 0'),
  image_url: z.string().optional(),
  isActive: z.boolean().default(true),
  productEdition: z.string().default('Standard'),
  stock: z.coerce.number().min(0).default(100),
  productType: z.string().default('GAME'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductsClient({ initialData }: { initialData: any[] }) {
  const { data: products } = useAdminProducts(initialData);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, stock: 100, productType: 'GAME', productEdition: 'Standard' }
  });

  const openCreateModal = () => {
    reset({ isActive: true, stock: 100, productType: 'GAME', productEdition: 'Standard' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    reset({
      title: product.title,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      isActive: product.isActive,
      productEdition: product.productEdition,
      stock: product.stock,
      productType: product.productType,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || ''
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    if (editingId) {
      updateProduct.mutate({ id: editingId, data }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createProduct.mutate(data, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить этот товар?')) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Товары</h1>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить Товар
        </button>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1F1F1F]/50 border-b border-[#1F1F1F]">
              <tr>
                <th className="px-6 py-4 font-medium">Товар</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Издание</th>
                <th className="px-6 py-4 font-medium">Цена</th>
                <th className="px-6 py-4 font-medium">Сток</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {products?.map((product: any) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden bg-[#1F1F1F]">
                        <Image 
                          src={product.image_url || '/static/default/default-product.png'} 
                          alt={product.title} 
                          width={40} 
                          height={40} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate max-w-[200px]">
                        <p className="font-medium text-white truncate">{product.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{product.productType}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{product.productEdition}</td>
                  <td className="px-6 py-4 font-medium text-white">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {product.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEditModal(product)} className="text-[#A1A1AA] hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-[#A1A1AA] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#A1A1AA]">
                    Нет товаров.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F]">
              <h2 className="text-xl font-bold">{editingId ? 'Редактировать товар' : 'Новый товар'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">Название</label>
                  <input {...register('title')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                  {errors.title && <p className="text-red-500 text-xs">{String(errors.title.message)}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">Цена (₽)</label>
                  <input type="number" {...register('price')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">Тип (GAME, WALLET, SERVICE_PLANS)</label>
                  <input {...register('productType')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">Издание (Standard, Premium...)</label>
                  <input {...register('productEdition')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">Сток (Кол-во)</label>
                  <input type="number" {...register('stock')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">URL Изображения</label>
                  <input {...register('image_url')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A1AA]">Описание</label>
                <textarea {...register('description')} rows={3} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">SEO Название</label>
                  <input {...register('seoTitle')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#A1A1AA]">SEO Описание</label>
                  <input {...register('seoDescription')} className="w-full bg-[#1F1F1F] border border-[#333] rounded-lg px-3 py-2 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 rounded bg-[#1F1F1F] border-[#333] text-blue-500" />
                <label htmlFor="isActive" className="text-sm font-medium text-white">Активный товар</label>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-white bg-[#1F1F1F] hover:bg-[#333] transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="px-4 py-2 rounded-lg font-medium text-sm text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors">
                  {editingId ? 'Сохранить изменения' : 'Создать товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
