import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import z from "zod"

const replySchema = z.object({
  text: z.string().min(1, "Сообщение не может быть пустым")
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизованный доступ" }, { status: 401 })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        attachments: true
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 })
    }

    // Security check: ensure user owns this ticket (or is admin)
    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      ticket,
      messages
    })
  } catch (error) {
    console.error("[Support Ticket Messages Fetch API Error]", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизованный доступ" }, { status: 401 })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 })
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const body = await req.json()
    const validation = replySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        errors: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { text } = validation.data
    const isAdmin = session.user.role === 'ADMIN'

    await prisma.$transaction(async (tx) => {
      // 1. Create the reply message
      await tx.supportMessage.create({
        data: {
          ticketId: id,
          senderId: session.user.id,
          text,
          isAdmin
        }
      })

      // 2. Automatically update ticket status
      // If user replies, set status to OPEN (or keep IN_PROGRESS)
      // If admin replies, set status to AWAITING_USER
      let nextStatus = ticket.status
      if (isAdmin) {
        nextStatus = 'AWAITING_USER'
      } else if (ticket.status === 'AWAITING_USER' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        nextStatus = 'OPEN'
      }

      await tx.supportTicket.update({
        where: { id },
        data: {
          status: nextStatus,
          updatedAt: new Date()
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Support Ticket Reply API Error]", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
