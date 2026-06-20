'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { balance: 'desc' }
  });
  return users;
}

import { USER_ROLE } from "@prisma/client";

export interface UserInput {
  role: USER_ROLE;
  balance: number | string;
  discount: number | string;
  isBanned: boolean;
}

export async function updateUser(id: string, data: UserInput) {
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
