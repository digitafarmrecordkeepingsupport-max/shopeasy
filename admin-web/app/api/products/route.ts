import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { Product } from '../../../models/Product';
import { Category } from '../../../models/Category';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('featured');

    if (isMongoDBConfigured()) {
      await connectToDatabase();

      const query: any = { isActive: true };
      if (categoryId && categoryId !== 'all') {
        query.categoryId = categoryId;
      }
      if (isFeatured === 'true') {
        query.isFeatured = true;
      }
      if (search && search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { categoryName: { $regex: search, $options: 'i' } },
        ];
      }

      const products = await Product.find(query).sort({ createdAt: -1 }).lean();

      if (products.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'mongodb',
          count: products.length,
          data: products.map((p: any) => ({
            ...p,
            id: p._id.toString(),
          })),
        });
      }
    }

    // Default mock response if MongoDB is not populated or offline
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: [
        {
          id: 'prod-earbuds-03',
          name: 'Wireless Earbuds',
          slug: 'wireless-earbuds',
          description: 'White wireless earbuds with active noise cancellation.',
          categoryId: 'cat-electronics',
          categoryName: 'Electronics',
          price: 25000,
          originalPrice: 32000,
          stockQuantity: 45,
          sku: 'SE-EBD-003',
          imageUrls: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800'],
          isFeatured: true,
          isActive: true,
        },
        {
          id: 'prod-watch-02',
          name: 'Smart Watch',
          slug: 'smart-watch',
          description: 'Black smartwatch with AMOLED display.',
          categoryId: 'cat-electronics',
          categoryName: 'Electronics',
          price: 45000,
          originalPrice: 60000,
          stockQuantity: 28,
          sku: 'SE-WTC-002',
          imageUrls: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800'],
          isFeatured: true,
          isActive: true,
        },
        {
          id: 'prod-sneakers-01',
          name: 'Casual Sneakers',
          slug: 'casual-sneakers',
          description: 'Comfortable street sneakers.',
          categoryId: 'cat-fashion',
          categoryName: 'Fashion',
          price: 35000,
          originalPrice: 50000,
          stockQuantity: 32,
          sku: 'SE-SNK-001',
          imageUrls: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800'],
          isFeatured: true,
          isActive: true,
        },
      ],
    });
  } catch (error: any) {
    console.error('Products API GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (isMongoDBConfigured()) {
      await connectToDatabase();

      const slug =
        body.slug ||
        body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
        'product';

      const sku = body.sku || `SE-${Math.floor(1000 + Math.random() * 9000)}`;

      const newProduct = await Product.create({
        ...body,
        slug,
        sku,
      });

      // Increment category item count
      if (body.categoryId) {
        await Category.findOneAndUpdate(
          { $or: [{ _id: body.categoryId }, { slug: body.categoryId }] },
          { $inc: { itemCount: 1 } }
        );
      }

      return NextResponse.json({
        success: true,
        data: newProduct,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product processed (mock mode)',
      data: { ...body, id: 'prod-' + Date.now().toString(36) },
    });
  } catch (error: any) {
    console.error('Products API POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
