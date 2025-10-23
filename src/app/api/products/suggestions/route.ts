import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { cartItemIds } = await request.json();

    if (!cartItemIds || !Array.isArray(cartItemIds)) {
      return NextResponse.json(
        { error: "cartItemIds array is required" },
        { status: 400 }
      );
    }

    // Get products from cart to find their related products
    const cartProducts = await prisma.product.findMany({
      where: {
        id: {
          in: cartItemIds
        }
      },
      select: {
        id: true,
        relatedProductIds: true
      }
    });

    // Collect all related product IDs
    const relatedProductIds: string[] = [];
    cartProducts.forEach(product => {
      if (product.relatedProductIds && Array.isArray(product.relatedProductIds)) {
        relatedProductIds.push(...(product.relatedProductIds as string[]));
      }
    });

    // Remove duplicates and filter out products already in cart
    const uniqueRelatedIds = [...new Set(relatedProductIds)].filter(
      id => !cartItemIds.includes(id)
    );

    if (uniqueRelatedIds.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Fetch the related products
    const suggestions = await prisma.product.findMany({
      where: {
        id: {
          in: uniqueRelatedIds
        },
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        sizeOptions: true,
        category: {
          select: {
            name: true
          }
        },
        preparationTime: true
      },
      take: 6 // Limit to 6 suggestions
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching product suggestions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}