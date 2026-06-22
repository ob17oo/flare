import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/shared/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Неавторизованный доступ" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        referrals: {
          include: {
            orders: {
              where: {
                status: {
                  in: ['SUCCESS', 'PAID']
                }
              },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = `ref-${Math.random().toString(36).substring(2, 11)}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      });
    }

    const totalReferrals = user.referrals.length;
    const activeReferrals = user.referrals.filter(ref => ref.orders.length > 0).length;

    // Calculate discount based on active referrals
    let calculatedDiscount = 0;
    if (activeReferrals >= 20) calculatedDiscount = 20;
    else if (activeReferrals >= 15) calculatedDiscount = 15;
    else if (activeReferrals >= 10) calculatedDiscount = 10;
    else if (activeReferrals >= 5) calculatedDiscount = 5;
    else if (activeReferrals >= 3) calculatedDiscount = 3;
    else if (activeReferrals >= 1) calculatedDiscount = 1;

    // Update the database discount column to match the calculated dynamic discount
    if (user.discount !== calculatedDiscount) {
      await prisma.user.update({
        where: { id: user.id },
        data: { discount: calculatedDiscount }
      });
    }

    // Determine next threshold
    let nextThreshold = null;
    let nextDiscount = null;
    if (activeReferrals < 1) { nextThreshold = 1; nextDiscount = 1; }
    else if (activeReferrals < 3) { nextThreshold = 3; nextDiscount = 3; }
    else if (activeReferrals < 5) { nextThreshold = 5; nextDiscount = 5; }
    else if (activeReferrals < 10) { nextThreshold = 10; nextDiscount = 10; }
    else if (activeReferrals < 15) { nextThreshold = 15; nextDiscount = 15; }
    else if (activeReferrals < 20) { nextThreshold = 20; nextDiscount = 20; }

    return NextResponse.json({
      referralCode,
      totalReferrals,
      activeReferrals,
      discount: calculatedDiscount,
      nextThreshold,
      nextDiscount,
      hasReferrer: !!user.referredById
    });

  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
