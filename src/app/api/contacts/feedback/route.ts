import { NextResponse } from "next/server"
import z from "zod"

const feedbackSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  subject: z.string().min(3, "Тема должна содержать минимум 3 символа"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов")
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = feedbackSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        errors: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { name, email, subject, message } = validation.data
    console.log(`[Feedback Form] Received message from ${name} (${email}) regarding "${subject}": ${message}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Feedback API Error]", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
