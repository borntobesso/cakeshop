import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const all = searchParams.get('all'); // Admin: fetch all products

    // If 'all' parameter is present, fetch all products (for admin)
    if (all === 'true') {
      const products = await prisma.product.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
        orderBy: [{ categoryId: 'asc' }, { displayOrder: 'asc' }],
      });

      return NextResponse.json({ products });
    }

    // Original functionality: fetch by category
    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Find the category first
    const category = await prisma.productCategory.findUnique({
      where: { slug: categorySlug, isActive: true }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Fetch products for this category
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        isAvailable: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        isAvailable: data.isAvailable ?? true,
        stock: data.stock ?? 0,
        displayOrder: data.displayOrder ?? 0,
        categoryId: data.categoryId,
        allergens: data.allergens || null,
        availableForPickup: data.availableForPickup ?? true,
        ingredients: data.ingredients || null,
        longDescription: data.longDescription || null,
        preparationTime: data.preparationTime || 0,
        storage: data.storage || null,
        sizeOptions: data.sizeOptions || null,
        relatedProductIds: data.relatedProductIds || null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}