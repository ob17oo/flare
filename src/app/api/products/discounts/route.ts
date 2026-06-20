import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { parseProductTags } from "@/entities/admin/api/products.action";

export const dynamic = 'force-dynamic';

interface FormattedProduct {
  id: number;
  title: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  launcher: unknown;
  provider: unknown;
  url: string;
  categoryLabel?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        productType: {
          in: ["GAME", "WALLET", "SERVICE_PLANS"]
        }
      },
      include: {
        game: { include: { launcher: true } },
        servicePlans: { include: { servicePlatform: true } },
        wallet: { include: { walletProvider: true } }
      }
    });

    const games: FormattedProduct[] = [];
    const subscriptions: FormattedProduct[] = [];
    const wallets: FormattedProduct[] = [];

    for (const p of products) {
      const parsed = await parseProductTags(p);
      const discountPercent = parsed.discountPercent || 0;
      const oldPrice = parsed.oldPrice || p.price;

      // Only products with active discount
      if (discountPercent === 0 || oldPrice <= p.price) {
        continue;
      }

      const formatted = {
        ...parsed,
        oldPrice,
        discountPercent,
        launcher: p.game?.launcher || null,
        provider: p.wallet?.walletProvider || p.servicePlans?.servicePlatform || null,
        url: p.productType === "GAME" 
          ? `/games/${p.id}` 
          : p.productType === "SERVICE_PLANS" 
            ? `/subscriptions/${p.servicePlans?.servicePlatform?.id || p.id}` 
            : `/wallets?walletId=${p.wallet?.walletProvider?.id || p.id}`,
        categoryLabel: ""
      };

      if (p.productType === "GAME") {
        formatted.categoryLabel = "Игры";
        games.push(formatted);
      } else if (p.productType === "SERVICE_PLANS") {
        formatted.categoryLabel = "Подписки";
        subscriptions.push(formatted);
      } else if (p.productType === "WALLET") {
        formatted.categoryLabel = "Пополнение кошельков";
        wallets.push(formatted);
      }
    }

    // Sort by discount percent descending inside each category
    games.sort((a, b) => b.discountPercent - a.discountPercent);
    subscriptions.sort((a, b) => b.discountPercent - a.discountPercent);
    wallets.sort((a, b) => b.discountPercent - a.discountPercent);

    return NextResponse.json({
      games,
      subscriptions,
      wallets
    });
  } catch (error) {
    console.error("Discounts API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
