import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { Category } from '../../../models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        count: categories.length,
        data: categories.map((c: any) => ({
          ...c,
          id: c._id.toString(),
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
    console.error('Categories API GET Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
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
        'category';

      const newCategory = await Category.create({
        ...body,
        slug,
      });

      return NextResponse.json({
        success: true,
        data: newCategory,
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...body, id: 'cat-' + Date.now().toString(36) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
