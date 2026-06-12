'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/shared/lib/auth";

export async function getAllTickets() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { login: true, email: true } },
      moderator: { select: { login: true } },
      _count: { select: { messages: true } }
    }
  });
  return tickets;
}

export async function getTicketDetails(id: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { login: true, email: true, image_url: true } },
      moderator: { select: { id: true, login: true } },
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  return ticket;
}

export async function updateTicketStatus(id: string, status: any) {
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/support');
  revalidatePath(`/admin/support/${id}`);
  return ticket;
}

export async function assignModerator(id: string, moderatorId: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { moderatorId }
  });
  revalidatePath('/admin/support');
  revalidatePath(`/admin/support/${id}`);
  return ticket;
}

export async function replyToTicket(ticketId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const message = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: session.user.id,
      text: content,
      isAdmin: true
    }
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { 
      status: 'AWAITING_USER',
      updatedAt: new Date()
    }
  });

  revalidatePath('/admin/support');
  revalidatePath(`/admin/support/${ticketId}`);
  return message;
}
