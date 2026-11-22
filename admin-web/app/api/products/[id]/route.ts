import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../../lib/mongodb';
import { Product } from '../../../../models/Product';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
      const product = await Product.findOne(query).lean();

      if (product) {
        return NextResponse.json({
          success: true,
          data: {
            ...product,
            id: (product as any)._id.toString(),
          },
        });
      }
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
      const updated = await Product.findOneAndUpdate(query, body, { new: true });

      if (updated) {
        return NextResponse.json({ success: true, data: updated });
      }
    }

    return NextResponse.json({ success: true, message: 'Updated (mock mode)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
      await Product.findOneAndUpdate(query, { isActive: false });
      return NextResponse.json({ success: true, message: 'Product archived' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
