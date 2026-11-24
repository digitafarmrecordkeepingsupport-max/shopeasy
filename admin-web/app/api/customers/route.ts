import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        count: customers.length,
        data: customers.map((c: any) => ({
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
