import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../../lib/mongodb';
import { Category } from '../../../../models/Category';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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
      const updated = await Category.findOneAndUpdate(query, body, { new: true });
      return NextResponse.json({ success: true, data: updated });
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
      await Category.findOneAndDelete(query);
      return NextResponse.json({ success: true, message: 'Category deleted' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
