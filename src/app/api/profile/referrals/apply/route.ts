import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Неавторизованный доступ' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Код не указан' }, { status: 400 });
    }

    // Parse the code if it's a URL
    let referralCode = code.trim();
    if (referralCode.includes('?ref=')) {
      const parts = referralCode.split('?ref=');
      referralCode = (parts[1] && parts[1].split('&')[0]) || referralCode;
    } else if (referralCode.includes('/')) {
      referralCode = referralCode.split('/').pop() || referralCode;
    }

    // Check if the user already has a referrer
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referredById: true, referralCode: true }
    });

    if (currentUser?.referredById) {
      return NextResponse.json({ error: 'Вы уже ввели реферальный код' }, { status: 400 });
    }

    // Check if user is trying to use their own code
    if (currentUser?.referralCode === referralCode) {
      return NextResponse.json({ error: 'Нельзя использовать свой собственный код' }, { status: 400 });
    }

    // Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode }
    });

    if (!referrer) {
      return NextResponse.json({ error: 'Реферальный код не найден' }, { status: 404 });
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referredById: referrer.id }
    });

    return NextResponse.json({ success: true, message: 'Реферальный код успешно применен' });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
