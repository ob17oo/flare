'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { STATUS } from "@prisma/client";
import { generateProductKey } from "@/shared/lib/utils/productKey";

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

export async function updateOrderStatus(id: number, status: STATUS) {
  // Fetch existing order with relations
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      ticket: true,
      product: true,
      user: true,
    }
  });

  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  // Automate digital product key generation and email notifications if status becomes SUCCESS or PAID manually
  if ((status === 'SUCCESS' || status === 'PAID') && !order.ticket) {
    const productKey = generateProductKey();

    // 1. Create the ticket in the database
    await prisma.ticket.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        productKey
      }
    });
    console.log(`[Admin Panel] Ticket created for Order #${order.id}`);

    // 2. Decrement product stock
    await prisma.product.update({
      where: { id: order.productId },
      data: { stock: { decrement: 1 } }
    });

  }

  // Update order status in database
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status }
  });

  console.log(`[Admin Panel] Order #${id} status updated to ${status}`);
  revalidatePath('/admin/orders');
  return updatedOrder;
}

export async function deleteOrder(id: number) {
  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/orders');
  return { success: true };
}
