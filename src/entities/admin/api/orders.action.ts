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

import { STATUS } from "@prisma/client";

export async function updateOrderStatus(id: number, status: STATUS) {
  const order = await prisma.order.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/orders');
  return order;
}

export async function deleteOrder(id: number) {
  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/orders');
  return { success: true };
}
