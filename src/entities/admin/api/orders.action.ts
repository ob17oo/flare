'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, login: true, email: true, image_url: true }
      },
      product: {
        select: { id: true, title: true, price: true, image_url: true }
      }
    }
  });
  return orders;
}

export async function updateOrderStatus(id: string, status: any) {
  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status }
  });
  revalidatePath('/admin/orders');
  return order;
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id: Number(id) } });
  revalidatePath('/admin/orders');
  return { success: true };
}
