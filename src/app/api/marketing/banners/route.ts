import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const banners = await prisma.heroBanner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } }
            ]
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error in GET /api/marketing/banners:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
