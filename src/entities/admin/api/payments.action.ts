'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllPayments() {
  const payments = await prisma.deposit.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { login: true, email: true, image_url: true }
      }
    }
  });
  return payments;
}

import { STATUS } from "@prisma/client";

export async function updatePaymentStatus(id: string, status: STATUS) {
  const deposit = await prisma.deposit.findUnique({ where: { id } });
  if (!deposit) throw new Error("Payment not found");

  const updated = await prisma.deposit.update({
    where: { id },
    data: { status }
  });

  // If manual approval, add to user balance? This might be risky, but let's do it if it changes from PENDING to SUCCESS
  if (deposit.status !== 'SUCCESS' && status === 'SUCCESS') {
    await prisma.user.update({
      where: { id: deposit.userId },
      data: { balance: { increment: deposit.amount } }
    });
  } else if (deposit.status === 'SUCCESS' && status !== 'SUCCESS') {
    // If reverted
    await prisma.user.update({
      where: { id: deposit.userId },
      data: { balance: { decrement: deposit.amount } }
    });
  }

  revalidatePath('/admin/payments');
  return updated;
}
