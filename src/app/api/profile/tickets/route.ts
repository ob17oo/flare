import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { stripe } from '@/shared/lib/stripe';
import { generateProductKey } from '@/shared/lib/utils/productKey';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Неавторизованный доступ' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (stripeSession.payment_status === 'paid') {
          const order = await prisma.order.findUnique({
            where: { stripeId: sessionId },
            include: { product: true }
          });

          if (order && order.status === 'PENDING') {
            const userId = stripeSession.metadata?.userId;
            const productIdStr = stripeSession.metadata?.productId;
            const productId = productIdStr ? parseInt(productIdStr, 10) : NaN;
            const email = stripeSession.metadata?.email;
            const promocode = stripeSession.metadata?.promocode || null;

            if (userId && !isNaN(productId) && email) {
              await prisma.$transaction(async (tx) => {
                const txOrder = await tx.order.findUnique({
                  where: { id: order.id },
                  include: { product: true }
                });

                if (txOrder && txOrder.status === 'PENDING') {
                  // Update order status
                  await tx.order.update({
                    where: { id: order.id },
                    data: { status: 'SUCCESS' }
                  });

                  // Update/Create deposit status
                  const existingDeposit = await tx.deposit.findUnique({
                    where: { stripeId: sessionId }
                  });

                  if (existingDeposit) {
                    await tx.deposit.update({
                      where: { id: existingDeposit.id },
                      data: { status: 'PAID' }
                    });
                  } else {
                    await tx.deposit.create({
                      data: {
                        userId,
                        amount: txOrder.product.price,
                        stripeId: sessionId,
                        status: 'PAID'
                      }
                    });
                  }

                  // Decrement stock
                  await tx.product.update({
                    where: { id: productId },
                    data: { stock: { decrement: 1 } }
                  });

                  // Update promocode uses
                  if (promocode) {
                    await tx.promocode.update({
                      where: { code: promocode.toUpperCase() },
                      data: { usesCount: { increment: 1 } }
                    });
                  }

                  // Generate product key and create ticket
                  const productKey = generateProductKey();
                  await tx.ticket.create({
                    data: {
                      userId,
                      orderId: order.id,
                      productKey
                    }
                  });
                }
              }, {
                timeout: 10000,
                maxWait: 2000,
                isolationLevel: 'Serializable'
              });
              console.log(`[Stripe Fallback Sync Success] Fulfilled product purchase for session ${sessionId}`);
            }
          }
        }
      } catch (stripeErr) {
        console.error("[Stripe Fallback Sync Error] Failed to retrieve or process stripe session:", stripeErr);
      }
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        order: {
          include: {
            product: {
              select: { title: true, image_url: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching digital tickets:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
