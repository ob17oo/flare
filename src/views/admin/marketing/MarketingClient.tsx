'use client';

import { useState } from 'react';
import { useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/entities/admin/hooks/useAdminBanners';
import { Plus, Edit2, Trash2, X, Eye, Percent, Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUploadDropzone } from '../products/components/ImageUploadDropzone';
import Image from 'next/image';
import { getAllBanners } from '@/entities/admin/api/marketing.action';
import { ErrorMessage } from '@/shared/components';

const bannerSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().min(1, 'Пожалуйста, загрузите изображение'),
  buttonText: z.string().min(1, 'Обязательное поле').default('Подробнее'),
  linkType: z.string().default('URL'),
  linkUrl: z.string().min(1, 'Обязательное поле'),
  promoCode: z.string().optional(),
  promoDiscount: z.coerce.number().min(0, 'Не менее 0').max(100, 'Не более 100').default(10),
  sortOrder: z.coerce.number().min(0, 'Не менее 0'),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

type BannerFormData = z.infer<typeof bannerSchema>;
type BannerType = Awaited<ReturnType<typeof getAllBanners>>[number];

export function MarketingClient({ initialData }: { initialData: BannerType[] }) {
  const { data: banners } = useAdminBanners(initialData);
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { isActive: true, sortOrder: 0, buttonText: 'Подробнее', linkType: 'URL', image_url: '', promoDiscount: 10 }
  });

  // Watch fields for live preview
  const watchTitle = watch('title');
  const watchSubtitle = watch('subtitle');
  const watchDescription = watch('description');
  const watchImageUrl = watch('image_url');
  const watchButtonText = watch('buttonText');
  const watchPromoCode = watch('promoCode');

  const openCreateModal = () => {
    reset({ isActive: true, sortOrder: 0, buttonText: 'Подробнее', linkType: 'URL', image_url: '', title: '', subtitle: '', description: '', linkUrl: '', promoCode: '', promoDiscount: 10, startDate: '', endDate: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerType) => {
    reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url,
      buttonText: banner.buttonText || 'Подробнее',
      linkType: banner.linkType,
      linkUrl: banner.linkUrl,
      promoCode: banner.promoCode || '',
      promoDiscount: banner.promoDiscount || 10,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''
    });
    setEditingId(banner.id);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    const formData = data as BannerFormData;
    const payload = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
    };

    if (editingId) {
      updateBannerMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createBannerMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить это маркетинговое предложение?')) {
      deleteBannerMutation.mutate(id);
    }
  };

  const handleToggleActive = (banner: BannerType) => {
    updateBannerMutation.mutate({
      id: banner.id,
      data: {
        ...banner,
        isActive: !banner.isActive
      }
    });
  };

  // Helper calculation for CTR
  const calculateCTR = (clicks: number, views: number) => {
    if (!views) return '0.00%';
    return `${((clicks / views) * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-500" />
            Маркетинговые баннеры
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">Управляйте предложениями на главном слайдере магазина</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Добавить баннер
        </button>
      </div>

      {deleteBannerMutation.isError && (
        <ErrorMessage message={deleteBannerMutation.error instanceof Error ? deleteBannerMutation.error.message : 'Не удалось удалить баннер'} />
      )}

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#121212] border border-[#1F1F1F] p-5 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Всего показов</p>
            <p className="text-2xl font-bold text-white mt-1">
              {banners?.reduce((acc: number, curr: BannerType) => acc + (curr.viewsCount || 0), 0).toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
        
        <div className="bg-[#121212] border border-[#1F1F1F] p-5 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Всего кликов</p>
            <p className="text-2xl font-bold text-white mt-1">
              {banners?.reduce((acc: number, curr: BannerType) => acc + (curr.clicksCount || 0), 0).toLocaleString('ru-RU')}
            </p>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1F1F1F] p-5 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Средний CTR</p>
            <p className="text-2xl font-bold text-white mt-1">
              {(() => {
                const totalViews = banners?.reduce((acc: number, curr: BannerType) => acc + (curr.viewsCount || 0), 0) || 0;
                const totalClicks = banners?.reduce((acc: number, curr: BannerType) => acc + (curr.clicksCount || 0), 0) || 0;
                return calculateCTR(totalClicks, totalViews);
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#A1A1AA] uppercase bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-4 font-medium">Баннер</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Тип ссылки</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Сортировка</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Промокод</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Период действия</th>
                <th className="px-6 py-4 font-medium">Показы / Клики (CTR)</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {banners?.map((banner: BannerType) => (
                <tr key={banner.id} className="hover:bg-[#1A1A1A] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#2A2A2A] border border-[#333] shrink-0 relative">
                        <Image 
                          src={banner.image_url} 
                          alt={banner.title} 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate max-w-[200px]">
                        <p className="font-semibold text-white truncate text-base">{banner.title}</p>
                        {banner.subtitle && <p className="text-xs text-[#A1A1AA] truncate mt-0.5">{banner.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] font-semibold hidden md:table-cell">
                    <span className="bg-[#1F1F1F] px-2.5 py-1 rounded-md text-xs text-white border border-[#333]">
                      {banner.linkType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] hidden sm:table-cell font-bold">{banner.sortOrder}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {banner.promoCode ? (
                      <span className="text-yellow-500 font-bold text-xs bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded uppercase">
                        {banner.promoCode}
                      </span>
                    ) : (
                      <span className="text-[#555]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#A1A1AA] text-xs hidden lg:table-cell">
                    {banner.startDate || banner.endDate ? (
                      <div className="flex flex-col gap-0.5">
                        {banner.startDate && <span>с {new Date(banner.startDate).toLocaleDateString('ru-RU')}</span>}
                        {banner.endDate && <span>до {new Date(banner.endDate).toLocaleDateString('ru-RU')}</span>}
                      </div>
                    ) : (
                      <span>Постоянно</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                      <span className="text-white font-bold">{banner.viewsCount || 0}</span>
                      <span>/</span>
                      <span className="text-white font-bold">{banner.clicksCount || 0}</span>
                      <span className="bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded ml-1">
                        {calculateCTR(banner.clicksCount || 0, banner.viewsCount || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleActive(banner)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        banner.isActive 
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                          : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                      }`}
                    >
                      {banner.isActive ? 'Активен' : 'Отключен'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(banner)} className="text-[#A1A1AA] hover:text-white transition-colors w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5" aria-label="Редактировать баннер">
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="text-[#A1A1AA] hover:text-red-500 transition-colors w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5" aria-label="Удалить баннер">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!banners || banners.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#A1A1AA]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Megaphone className="w-8 h-8 text-[#333]" />
                      <p className="text-sm font-semibold">Список маркетинговых баннеров пуст</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Modal Dialog with Real-Time Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl w-full max-w-5xl my-8 flex flex-col lg:flex-row overflow-hidden shadow-2xl">
            
            {/* Left Column: Editor Form */}
            <div className="flex-1 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[#1F1F1F] overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between pb-6 border-b border-[#1F1F1F] mb-6">
                <h2 className="text-xl font-bold">{editingId ? 'Редактировать предложение' : 'Новое предложение'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white lg:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {(createBannerMutation.isError || updateBannerMutation.isError) && (
                  <ErrorMessage 
                    message={
                      (createBannerMutation.error instanceof Error ? createBannerMutation.error.message : '') || 
                      (updateBannerMutation.error instanceof Error ? updateBannerMutation.error.message : '') || 
                      'Не удалось сохранить предложение'
                    } 
                  />
                )}

                {/* Image Upload Box */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A1A1AA]">Баннерное изображение <span className="text-red-500">*</span></label>
                  <ImageUploadDropzone 
                    bucket="marketing"
                    folder="banners"
                    existingUrl={watchImageUrl}
                    onUploadComplete={(url) => setValue('image_url', url, { shouldValidate: true })}
                    onUploadError={(err) => alert(err)}
                    label="Перетащите изображение баннера сюда"
                    minWidth={1440}
                    minHeight={1080}
                  />
                  {errors.image_url && <p className="text-red-500 text-xs">{String(errors.image_url.message)}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Заголовок <span className="text-red-500">*</span></label>
                    <input {...register('title')} placeholder="Пополнение Steam без комиссии" className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white text-sm" />
                    {errors.title && <p className="text-red-500 text-xs">{String(errors.title.message)}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Подзаголовок</label>
                    <input {...register('subtitle')} placeholder="Скидка 10% на первый заказ" className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#A1A1AA]">Описание предложения</label>
                  <textarea {...register('description')} rows={3} placeholder="Введите детальное описание акции для привлечения внимания..." className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg p-3 text-white text-sm resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Тип перехода <span className="text-red-500">*</span></label>
                    <select {...register('linkType')} className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3 h-11 text-white text-sm">
                      <option value="URL">Внешний URL</option>
                      <option value="PRODUCT">Товар (Детали)</option>
                      <option value="CATEGORY">Категория</option>
                      <option value="SEARCH">Поисковый запрос</option>
                      <option value="PAGE">Внутренняя страница</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Адрес перехода / Путь <span className="text-red-500">*</span></label>
                    <input {...register('linkUrl')} placeholder="/wallets/steam или https://..." className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white text-sm" />
                    {errors.linkUrl && <p className="text-red-500 text-xs">{String(errors.linkUrl.message)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Текст кнопки</label>
                    <input {...register('buttonText')} placeholder="Подробнее" className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white text-sm" />
                    {errors.buttonText && <p className="text-red-500 text-xs">{String(errors.buttonText.message)}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Порядок сортировки</label>
                    <input type="number" {...register('sortOrder')} className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white text-sm" />
                  </div>
                </div>

                <div className="border-t border-[#1F1F1F] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA]">Промокод (необязательно)</label>
                    <input {...register('promoCode')} placeholder="FIRSTORDER" className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white uppercase text-sm" />
                  </div>

                  {watchPromoCode && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#A1A1AA]">Размер скидки (%)</label>
                      <input type="number" {...register('promoDiscount')} placeholder="10" className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3.5 h-11 text-white text-sm" />
                      {errors.promoDiscount && <p className="text-red-500 text-xs">{String(errors.promoDiscount.message)}</p>}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Дата начала (UTC)
                    </label>
                    <input type="datetime-local" {...register('startDate')} className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3 h-11 text-white text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Дата окончания (UTC)
                    </label>
                    <input type="datetime-local" {...register('endDate')} className="w-full bg-[#1F1F1F] border border-[#333] focus:border-blue-500 outline-none rounded-lg px-3 h-11 text-white text-sm" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 py-2 cursor-pointer select-none w-fit">
                    <input type="checkbox" {...register('isActive')} className="w-5 h-5 rounded bg-[#1F1F1F] border-[#333] text-blue-600 outline-none focus:ring-0" />
                    <span className="text-sm font-medium text-white">Отображать на главной (Активный)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[#1F1F1F] mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-semibold text-sm text-[#A1A1AA] hover:text-white bg-[#1F1F1F] hover:bg-[#2A2A2A] transition-colors min-h-11">
                    Отмена
                  </button>
                  <button type="submit" disabled={createBannerMutation.isPending || updateBannerMutation.isPending} className="px-5 py-2.5 rounded-lg font-semibold text-sm text-black bg-white hover:bg-white/90 disabled:opacity-50 transition-colors min-h-11 shadow-lg shadow-white/5">
                    {editingId ? 'Сохранить' : 'Опубликовать'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Real-time Live Preview Panel */}
            <div className="w-full lg:w-[420px] bg-[#0A0A0A] p-6 lg:p-8 flex flex-col justify-between max-h-[85vh]">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#1F1F1F] mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5 text-blue-500" />
                    Интерактивный предпросмотр
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-[#A1A1AA] hover:text-white hidden lg:block">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Simulated Storefront Slideshow Container */}
                <div className="w-full h-[300px] rounded-2xl relative overflow-hidden border border-[#222] bg-[#15171A] flex flex-col justify-end p-5 shadow-inner">
                  {watchImageUrl ? (
                    <Image 
                      src={watchImageUrl} 
                      alt="Banner Preview" 
                      fill 
                      className="opacity-30 object-cover object-center" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 gap-2 text-[#444] z-0">
                      <Megaphone className="w-10 h-10" />
                      <p className="text-xs">Изображение баннера не загружено</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E10] via-[#0E0E10]/80 to-transparent z-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10]/95 via-transparent to-transparent z-0" />

                  {/* Overlay text elements */}
                  <div className="relative z-10 flex flex-col gap-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-[18px] uppercase tracking-tight text-white leading-tight line-clamp-2">
                        {watchTitle ? watchTitle.toUpperCase() : 'ЗАГОЛОВОК ПРЕДЛОЖЕНИЯ'}
                      </h4>
                      {(watchSubtitle || watchDescription) && (
                        <p className="text-[12px] text-[#B7BDC9] leading-relaxed line-clamp-3">
                          {watchSubtitle ? `${watchSubtitle}. ` : ''}
                          {watchDescription || ''}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-blue-600 text-white text-[12px] font-bold rounded-lg cursor-default shadow-md w-fit"
                      >
                        {watchButtonText || 'Подробнее'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-[#121212] border border-[#1F1F1F] rounded-xl p-4 space-y-2.5 text-xs text-[#A1A1AA]">
                  <p className="font-bold text-white">Инструкция по предпросмотру:</p>
                  <p>1. Загрузите картинку и заполните заголовок для мгновенного обновления превью.</p>
                  <p>2. Баннер будет размещён на главной странице согласно приоритету сортировки.</p>
                  <p>3. На ПК обложка автоматически сдвигается вправо, сохраняя читаемость текста.</p>
                </div>
              </div>

              <div className="text-[11px] text-[#555] text-center pt-6 lg:pt-0">
                Панель управления Flare Marketing
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
