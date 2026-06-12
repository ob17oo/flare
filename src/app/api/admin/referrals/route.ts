import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminCheck = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (adminCheck?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    // Users who have referred someone
    const referrers = await prisma.user.findMany({
      where: {
        referrals: {
          some: {}
        },
        OR: [
          { login: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { referralCode: { contains: search, mode: 'insensitive' } },
        ]
      },
      include: {
        referrals: {
          include: {
            orders: {
              where: { status: 'SUCCESS' },
              select: { id: true }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    const data = referrers.map(user => {
      const activeReferrals = user.referrals.filter(ref => ref.orders.length > 0).length;
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        referralCode: user.referralCode,
        totalReferrals: user.referrals.length,
        activeReferrals
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching admin referrals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
