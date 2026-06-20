'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { STATUS } from "@prisma/client";
import { generateProductKey } from "@/shared/lib/utils/productKey";
import { sendTicketEmail } from "@/shared/lib/email/emailService";

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

    // Create the ticket in the database
    await prisma.ticket.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        productKey
      }
    });

    // Decrement product stock
    await prisma.product.update({
      where: { id: order.productId },
      data: { stock: { decrement: 1 } }
    });

    // Construct email parameters
    const ticketInfo = {
      toEmail: order.email,
      productTitle: order.product.title,
      purchaseDate: new Date().toLocaleDateString('ru-RU'),
      orderId: order.id,
      price: order.product.price.toString(),
      paymentMethod: 'Панель управления (Вручную)',
      status: `Выдан администратором (${status})`,
      productKey,
    };

    // Send the email asynchronously without blocking the status update
    sendTicketEmail(ticketInfo).catch((emailErr) => {
      console.error(`[Admin Manual Activation Email Failure] Failed to send ticket email to ${order.email}:`, emailErr);
    });
  }

  // Update order status in database
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status }
  });

  revalidatePath('/admin/orders');
  return updatedOrder;
}

export async function deleteOrder(id: number) {
  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/orders');
  return { success: true };
}
