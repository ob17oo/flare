'use client';

import { useState, useEffect } from 'react';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/entities/admin/hooks/useAdminProducts';
import { formatPrice } from '@/shared/lib/utils';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUploadDropzone } from './components/ImageUploadDropzone';
import { getAllProducts } from '@/entities/admin/api/products.action';

const productSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  slug: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0, 'Цена должна быть больше 0'),
  oldPrice: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  currency: z.string().default('RUB'),
  image_url: z.string().optional(),
  bucket: z.string().optional(),
  imagePath: z.string().optional(),
  isActive: z.boolean().default(true),
  productEdition: z.string().default('Standard'),
  stock: z.coerce.number().min(0).default(100),
  productType: z.string().default('GAME'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;
type ProductType = Awaited<ReturnType<typeof getAllProducts>>[number];

export function ProductsClient({ initialData }: { initialData: ProductType[] }) {
  const { data: products } = useAdminProducts(initialData);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // UX states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, stock: 100, productType: 'GAME', productEdition: 'Standard', currency: 'RUB' }
  });

  const watchTitle = watch('title');
  const watchProductType = watch('productType');

  // Auto-generate slug from title if it's a new product and user hasn't typed in slug manually
  useEffect(() => {
    if (!editingId && watchTitle && !isDirty) {
      const generatedSlug = watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [watchTitle, editingId, setValue, isDirty]);

  const openCreateModal = () => {
    reset({ isActive: true, stock: 100, productType: 'GAME', productEdition: 'Standard', currency: 'RUB', slug: `product-${Date.now()}` });
    setEditingId(null);
    setSaveStatus('idle');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductType) => {
    const rawProduct = product as unknown as Record<string, unknown>;
    reset({
      title: product.title,
      slug: (rawProduct.slug as string) || '',
      shortDescription: (rawProduct.shortDescription as string) || '',
      description: product.description || '',
      price: product.price,
      oldPrice: (rawProduct.oldPrice as number | undefined) || '',
      discount: (rawProduct.discount as number | undefined) || '',
      currency: (rawProduct.currency as string | undefined) || 'RUB',
      image_url: product.image_url || '',
      bucket: (rawProduct.bucket as string | undefined) || '',
      imagePath: (rawProduct.imagePath as string | undefined) || '',
      isActive: product.isActive,
      productEdition: product.productEdition,
      stock: product.stock,
      productType: product.productType,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      tags: product.tags?.join(', ') || ''
    });
    setEditingId(product.id);
    setSaveStatus('idle');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    const formData = data as ProductFormData;
    setSaveStatus('saving');
    
    // Transform tags back to array
    const formattedData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, data: formattedData }, {
        onSuccess: () => {
          setSaveStatus('success');
          setTimeout(() => setIsModalOpen(false), 1000);
        },
        onError: (err) => {
          setSaveStatus('error');
          setErrorMessage(err.message);
        }
      });
    } else {
      createProduct.mutate(formattedData, {
        onSuccess: () => {
          setSaveStatus('success');
          setTimeout(() => setIsModalOpen(false), 1000);
        },
        onError: (err) => {
          setSaveStatus('error');
          setErrorMessage(err.message);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить этот товар? Действие необратимо.')) {
      deleteProduct.mutate(id);
    }
  };

  const getFolderType = (type: string) => {
    if (type === 'GAME') return 'games';
    if (type === 'WALLET') return 'wallets';
    if (type === 'SERVICE_PLANS') return 'services';
    return 'games'; // default fallback
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Товары</h1>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Создать товар
        </button>
      </div>

      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-4 font-medium">Товар</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Тип</th>
                <th className="px-6 py-4 font-medium">Цена</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Сток</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {products?.map((product: ProductType) => (
                <tr key={product.id} className="hover:bg-[#1A1A1A] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#2A2A2A] border border-[#333] shrink-0">
                        <Image 
                          src={product.image_url || '/static/default/default-product.png'} 
                          alt={product.title} 
                          width={48} 
                          height={48} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate max-w-[150px] sm:max-w-[250px]">
                        <p className="font-semibold text-white truncate text-base">{product.title}</p>
                        <p className="text-xs text-[#A1A1AA] truncate mt-0.5">/{(product as unknown as { slug?: string }).slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] font-medium hidden md:table-cell">{product.productType}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{formatPrice(product.price)}</span>
                      {product.oldPrice && <span className="text-xs text-red-400 line-through">{formatPrice(product.oldPrice)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-[#A1A1AA]">{product.isActive ? 'Активен' : 'Черновик'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(product)} className="p-2 text-[#A1A1AA] hover:text-white bg-[#2A2A2A] hover:bg-[#333] rounded-lg transition-colors cursor-pointer min-h-9 min-w-9 flex items-center justify-center">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-[#A1A1AA] hover:text-red-500 bg-[#2A2A2A] hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer min-h-9 min-w-9 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#A1A1AA] bg-[#1A1A1A]/50">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p>У вас еще нет товаров.</p>
                      <button onClick={openCreateModal} className="text-blue-500 font-medium hover:underline">Создать первый товар</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border-l border-[#1F1F1F] w-full max-w-3xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F] bg-[#121212] shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Редактировать товар' : 'Создать товар'}</h2>
                <p className="text-sm text-[#A1A1AA] mt-1">{isDirty && <span className="text-orange-400 mr-2">• Несохраненные изменения</span>}Заполните информацию о товаре</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white bg-[#1F1F1F] p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="productForm" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              
              {/* Section: Media */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-[#1F1F1F] pb-2">Медиа файлы</h3>
                <div className="bg-[#121212] p-5 rounded-xl border border-[#1F1F1F]">
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-3">Главное изображение (Обложка)</label>
                  <ImageUploadDropzone 
                    bucket="Products"
                    folder={getFolderType(watchProductType)}
                    existingUrl={watch('image_url')}
                    onUploadComplete={(url, path) => {
                      setValue('image_url', url, { shouldDirty: true });
                      setValue('imagePath', path, { shouldDirty: true });
                      setValue('bucket', 'Products', { shouldDirty: true });
                    }}
                  />
                  {errors.image_url && <p className="text-red-500 text-xs mt-2">{String(errors.image_url.message)}</p>}
                </div>
              </section>

              {/* Section: Basic Info */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-[#1F1F1F] pb-2">Основная информация</h3>
                <div className="bg-[#121212] p-5 rounded-xl border border-[#1F1F1F] space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Название <span className="text-red-500">*</span></label>
                      <input {...register('title')} placeholder="Например: Minecraft Premium" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-white outline-none transition-all" />
                      {errors.title && <p className="text-red-500 text-xs">{String(errors.title.message)}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">URL (Slug) <span className="text-red-500">*</span></label>
                      <input {...register('slug')} placeholder="minecraft-premium" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none transition-all font-mono text-sm" />
                      {errors.slug && <p className="text-red-500 text-xs">{String(errors.slug.message)}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Краткое описание</label>
                    <input {...register('shortDescription')} placeholder="Одно-два предложения для карточки товара" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Полное описание</label>
                    <textarea {...register('description')} rows={5} placeholder="Подробное описание характеристик товара..." className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-3 text-white outline-none transition-all resize-none custom-scrollbar" />
                  </div>
                </div>
              </section>

              {/* Section: Categorization */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-[#1F1F1F] pb-2">Категоризация и Статус</h3>
                <div className="bg-[#121212] p-5 rounded-xl border border-[#1F1F1F] space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Тип товара</label>
                      <select {...register('productType')} className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none">
                        <option value="GAME">Игры (Keys/Accounts)</option>
                        <option value="WALLET">Пополнение кошельков</option>
                        <option value="SERVICE_PLANS">Сервисы и Подписки</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Издание / Формат</label>
                      <input {...register('productEdition')} placeholder="Standard, Premium, Key..." className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#1A1A1A] p-4 rounded-lg border border-[#333]">
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input type="checkbox" id="isActive" {...register('isActive')} className="h-5 w-5 rounded border-[#555] bg-[#222] text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900 cursor-pointer" />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor="isActive" className="font-medium text-white cursor-pointer">Отображать в магазине</label>
                        <p className="text-[#A1A1AA]">Снимите галочку, чтобы скрыть товар от покупателей (сделать черновиком).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Price */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-[#1F1F1F] pb-2">Ценообразование и Склад</h3>
                <div className="bg-[#121212] p-5 rounded-xl border border-[#1F1F1F] space-y-5">
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Цена <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-[#A1A1AA]">₽</span>
                        <input type="number" {...register('price')} className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg pl-8 pr-4 py-2.5 text-white outline-none font-medium" />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs">{String(errors.price.message)}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Старая цена</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-[#A1A1AA]">₽</span>
                        <input type="number" {...register('oldPrice')} placeholder="0" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg pl-8 pr-4 py-2.5 text-white outline-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Скидка (%)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-[#A1A1AA]">%</span>
                        <input type="number" {...register('discount')} placeholder="0" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg pl-9 pr-4 py-2.5 text-white outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Остаток на складе (Сток) <span className="text-red-500">*</span></label>
                      <input type="number" {...register('stock')} className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#A1A1AA]">Валюта</label>
                      <select {...register('currency')} className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none opacity-80" disabled>
                        <option value="RUB">RUB (Российский рубль)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: SEO */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-[#1F1F1F] pb-2">SEO (Поисковая оптимизация)</h3>
                <div className="bg-[#121212] p-5 rounded-xl border border-[#1F1F1F] space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Meta Title</label>
                    <input {...register('seoTitle')} placeholder="Заголовок для поисковых систем" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Meta Description</label>
                    <textarea {...register('seoDescription')} rows={2} placeholder="Описание для поисковых систем..." className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#A1A1AA]">Теги / Keywords (через запятую)</label>
                    <input {...register('tags')} placeholder="minecraft, key, premium" className="w-full bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none" />
                  </div>
                </div>
              </section>

            </form>

            {/* Footer */}
            <div className="p-6 border-t border-[#1F1F1F] bg-[#121212] shrink-0 flex items-center justify-between">
              <div>
                {saveStatus === 'error' && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errorMessage || 'Ошибка при сохранении'}
                  </p>
                )}
                {saveStatus === 'success' && (
                  <p className="text-green-500 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Успешно сохранено!
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-medium text-sm text-[#A1A1AA] hover:text-white hover:bg-[#1F1F1F] transition-colors">
                  Отмена
                </button>
                <button 
                  type="submit" 
                  form="productForm"
                  disabled={createProduct.isPending || updateProduct.isPending || saveStatus === 'saving'} 
                  className="px-6 py-2.5 rounded-lg font-medium text-sm text-black bg-white hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-lg flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? <span className="animate-pulse">Сохранение...</span> : <><Save className="w-4 h-4" /> {editingId ? 'Сохранить изменения' : 'Создать товар'}</>}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
