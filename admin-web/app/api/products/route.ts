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

    return NextResponse.json({
      success: true,
      source: 'empty',
      count: 0,
      data: [],
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
