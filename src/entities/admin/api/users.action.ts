'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { balance: 'desc' }
  });
  return users;
}

export async function updateUser(id: string, data: any) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      role: data.role,
      balance: Number(data.balance),
      discount: Number(data.discount),
      isBanned: data.isBanned
    }
  });
  revalidatePath('/admin/users');
  return user;
}
