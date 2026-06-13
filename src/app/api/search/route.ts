import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { parseProductTags } from "@/entities/admin/api/products.action";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({
        games: [],
        subscriptions: [],
        wallets: []
      });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        productType: {
          in: ["GAME", "WALLET", "SERVICE_PLANS"]
        },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
          {
            game: {
              launcher: {
                title: { contains: q, mode: "insensitive" }
              }
            }
          },
          {
            wallet: {
              walletProvider: {
                title: { contains: q, mode: "insensitive" }
              }
            }
          },
          {
            servicePlans: {
              servicePlatform: {
                title: { contains: q, mode: "insensitive" }
              }
            }
          }
        ]
      },
      include: {
        game: { include: { launcher: true } },
        servicePlans: { include: { servicePlatform: true } },
        wallet: { include: { walletProvider: true } }
      },
      take: 20
    });

    const games: any[] = [];
    const subscriptions: any[] = [];
    const wallets: any[] = [];

    for (const p of products) {
      const parsed = await parseProductTags(p);
      const discountPercent = parsed.discountPercent || 0;
      const oldPrice = parsed.oldPrice || p.price;

      const formatted = {
        id: p.id,
        title: p.title,
        price: p.price,
        image_url: p.image_url,
        productType: p.productType,
        productEdition: p.productEdition,
        tags: p.tags,
        discountPercent,
        oldPrice,
        launcher: p.game?.launcher?.title || null,
        provider: p.wallet?.walletProvider?.title || p.servicePlans?.servicePlatform?.title || null,
        // The URL redirects contextual page
        url: p.productType === "GAME" 
          ? `/games/${p.id}` 
          : p.productType === "SERVICE_PLANS" 
            ? `/subscriptions/${p.servicePlans?.servicePlatform?.id || p.id}` 
            : `/wallets?walletId=${p.wallet?.walletProvider?.id || p.id}`
      };

      if (p.productType === "GAME") {
        games.push(formatted);
      } else if (p.productType === "SERVICE_PLANS") {
        subscriptions.push(formatted);
      } else if (p.productType === "WALLET") {
        wallets.push(formatted);
      }
    }

    return NextResponse.json({
      games,
      subscriptions,
      wallets
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
