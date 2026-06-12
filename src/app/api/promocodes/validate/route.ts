import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const promocode = await prisma.promocode.findUnique({
      where: { code }
    });

    if (!promocode) {
      return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
    }

    if (!promocode.isActive) {
      return NextResponse.json({ error: "Промокод не активен" }, { status: 400 });
    }

    if (promocode.usesCount >= promocode.maxUses) {
      return NextResponse.json({ error: "Лимит использований исчерпан" }, { status: 400 });
    }

    if (promocode.expiresAt && new Date() > new Date(promocode.expiresAt)) {
      return NextResponse.json({ error: "Срок действия промокода истек" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discount: promocode.discount
    });

  } catch (error) {
    console.error("Error validating promocode:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
