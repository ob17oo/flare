'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export interface BannerInput {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url: string;
  buttonText?: string | null;
  linkType: string;
  linkUrl: string;
  promoCode?: string | null;
  promoDiscount?: number | string;
  sortOrder?: number | string;
  isActive?: boolean;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

export async function getAllBanners() {
  try {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    const bannersWithDiscount = await Promise.all(banners.map(async (banner) => {
      if (banner.promoCode) {
        const promo = await prisma.promocode.findUnique({
          where: { code: banner.promoCode }
        });
        return {
          ...banner,
          promoDiscount: promo ? promo.discount : 10
        };
      }
      return {
        ...banner,
        promoDiscount: 0
      };
    }));

    return bannersWithDiscount;
  } catch (error) {
    console.error("Error in getAllBanners:", error);
    throw new Error("Не удалось загрузить баннеры");
  }
}

export async function createBanner(data: BannerInput) {
  try {
    const rawPromoCode = data.promoCode?.trim().toUpperCase() || null;
    const discountVal = Number(data.promoDiscount) || 10;

    if (rawPromoCode) {
      const existingPromo = await prisma.promocode.findUnique({
        where: { code: rawPromoCode }
      });
      if (!existingPromo) {
        await prisma.promocode.create({
          data: {
            code: rawPromoCode,
            discount: discountVal,
            isActive: true,
            maxUses: 1000,
            usesCount: 0
          }
        });
      } else {
        await prisma.promocode.update({
          where: { code: rawPromoCode },
          data: {
            discount: discountVal
          }
        });
      }
    }

    const banner = await prisma.heroBanner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        image_url: data.image_url,
        buttonText: data.buttonText || "Подробнее",
        linkType: data.linkType,
        linkUrl: data.linkUrl,
        promoCode: rawPromoCode,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
    revalidatePath('/admin/marketing');
    revalidatePath('/admin/promocodes');
    revalidatePath('/');
    return banner;
  } catch (error: unknown) {
    console.error("Error in createBanner:", error);
    const errMsg = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Не удалось создать баннер: ${errMsg}`);
  }
}

export async function updateBanner(id: number, data: BannerInput) {
  try {
    const rawPromoCode = data.promoCode?.trim().toUpperCase() || null;
    const discountVal = Number(data.promoDiscount) || 10;

    if (rawPromoCode) {
      const existingPromo = await prisma.promocode.findUnique({
        where: { code: rawPromoCode }
      });
      if (!existingPromo) {
        await prisma.promocode.create({
          data: {
            code: rawPromoCode,
            discount: discountVal,
            isActive: true,
            maxUses: 1000,
            usesCount: 0
          }
        });
      } else {
        await prisma.promocode.update({
          where: { code: rawPromoCode },
          data: {
            discount: discountVal
          }
        });
      }
    }

    const banner = await prisma.heroBanner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        image_url: data.image_url,
        buttonText: data.buttonText || "Подробнее",
        linkType: data.linkType,
        linkUrl: data.linkUrl,
        promoCode: rawPromoCode,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
    revalidatePath('/admin/marketing');
    revalidatePath('/admin/promocodes');
    revalidatePath('/');
    return banner;
  } catch (error: unknown) {
    console.error("Error in updateBanner:", error);
    const errMsg = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Не удалось обновить баннер: ${errMsg}`);
  }
}

export async function deleteBanner(id: number) {
  try {
    await prisma.heroBanner.delete({
      where: { id }
    });
    revalidatePath('/admin/marketing');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error("Error in deleteBanner:", error);
    const errMsg = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Не удалось удалить баннер: ${errMsg}`);
  }
}

export async function incrementBannerImpressions(ids: number[]) {
  try {
    if (ids.length === 0) return { success: true };
    await prisma.heroBanner.updateMany({
      where: { id: { in: ids } },
      data: {
        viewsCount: { increment: 1 }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error in incrementBannerImpressions:", error);
    return { success: false };
  }
}

export async function incrementBannerClicks(id: number) {
  try {
    await prisma.heroBanner.update({
      where: { id },
      data: {
        clicksCount: { increment: 1 }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error in incrementBannerClicks:", error);
    return { success: false };
  }
}
