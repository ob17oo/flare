import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import z from "zod"

export const dynamic = 'force-dynamic'

const ticketCreateSchema = z.object({
  subject: z.string().min(4, "Тема должна содержать минимум 4 символа"),
  category: z.enum(["PAYMENT", "ORDER", "BALANCE", "REFUND", "BUG", "ACCOUNT", "OTHER"]),
  text: z.string().min(10, "Описание проблемы должно содержать минимум 10 символов"),
  attachments: z.array(z.object({
    fileUrl: z.string().url("Некорректная ссылка на файл"),
    fileName: z.string().min(1, "Имя файла не может быть пустым"),
    fileSize: z.number().nonnegative()
  })).optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизованный доступ" }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("[Support Ticket Fetch API Error]", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизованный доступ" }, { status: 401 })
    }

    const body = await req.json()
    const validation = ticketCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        errors: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { subject, category, text, attachments } = validation.data

    const newTicket = await prisma.$transaction(async (tx) => {
      // 1. Create the Ticket
      const ticket = await tx.supportTicket.create({
        data: {
          userId: session.user.id,
          subject,
          category,
          status: 'OPEN'
        }
      })

      // 2. Create the initial Support Message
      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: session.user.id,
          text,
          isAdmin: false
        }
      })

      // 3. Create Attachments if any
      if (attachments && attachments.length > 0) {
        await tx.supportAttachment.createMany({
          data: attachments.map(att => ({
            ticketId: ticket.id,
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            fileSize: att.fileSize
          }))
        })
      }

      return ticket
    })

    return NextResponse.json({ success: true, ticketId: newTicket.id })
  } catch (error) {
    console.error("[Support Ticket Create API Error]", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
