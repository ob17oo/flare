'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllPromocodes() {
  const promocodes = await prisma.promocode.findMany({
    orderBy: { id: 'desc' },
    include: {
      _count: { select: { orders: true } }
    }
  });
  return promocodes;
}

export async function createPromocode(data: any) {
  const promocode = await prisma.promocode.create({
    data: {
      code: data.code.toUpperCase(),
      discount: Number(data.discount),
      maxUses: Number(data.maxUses),
      isActive: data.isActive,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    }
  });
  revalidatePath('/admin/promocodes');
  return promocode;
}

export async function updatePromocode(id: number, data: any) {
  const promocode = await prisma.promocode.update({
    where: { id },
    data: {
      code: data.code.toUpperCase(),
      discount: Number(data.discount),
      maxUses: Number(data.maxUses),
      isActive: data.isActive,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    }
  });
  revalidatePath('/admin/promocodes');
  return promocode;
}

export async function deletePromocode(id: number) {
  await prisma.promocode.delete({
    where: { id }
  });
  revalidatePath('/admin/promocodes');
  return { success: true };
}
