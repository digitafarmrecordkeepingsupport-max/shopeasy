import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { User } from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).lean();

      if (customers.length > 0) {
        return NextResponse.json({
          success: true,
          count: customers.length,
          data: customers.map((c: any) => ({
            ...c,
            id: c._id.toString(),
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: [
        {
          id: 'cust-1',
          fullName: 'Jane Doe',
          email: 'jane.doe@mail.com',
          phoneNumber: '08012345678',
          totalOrders: 5,
          totalSpent: 245000,
          accountStatus: 'active',
          role: 'customer',
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
