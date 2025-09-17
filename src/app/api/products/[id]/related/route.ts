import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
      select: {
        relatedProductIds: true,
        categoryId: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let relatedProducts: any[] = []

    if (product.relatedProductIds && Array.isArray(product.relatedProductIds)) {
      relatedProducts = await prisma.product.findMany({
        where: {
          id: { in: product.relatedProductIds as string[] },
          isAvailable: true
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        take: 8
      })
    }

    if (relatedProducts.length < 4) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: resolvedParams.id },
          isAvailable: true,
          ...(relatedProducts.length > 0 && {
            id: { 
              notIn: [...relatedProducts.map(p => p.id), resolvedParams.id]
            }
          })
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        take: 8 - relatedProducts.length,
        orderBy: {
          displayOrder: 'asc'
        }
      })

      relatedProducts = [...relatedProducts, ...additionalProducts]
    }

    return NextResponse.json({ products: relatedProducts })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    )
  }
}