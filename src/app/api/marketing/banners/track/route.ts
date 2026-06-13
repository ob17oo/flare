import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, bannerId, bannerIds } = body;

    if (type === "impression") {
      const ids = Array.isArray(bannerIds) ? bannerIds.map(Number) : bannerId ? [Number(bannerId)] : [];
      if (ids.length > 0) {
        await prisma.heroBanner.updateMany({
          where: { id: { in: ids } },
          data: {
            viewsCount: { increment: 1 }
          }
        });
      }
      return NextResponse.json({ success: true });
    }

    if (type === "click") {
      if (bannerId) {
        await prisma.heroBanner.update({
          where: { id: Number(bannerId) },
          data: {
            clicksCount: { increment: 1 }
          }
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid tracking type" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST /api/marketing/banners/track:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
