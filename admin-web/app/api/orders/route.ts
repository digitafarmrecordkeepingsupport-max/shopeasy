import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { Order } from '../../../models/Order';
import { Product } from '../../../models/Product';
import { User } from '../../../models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    if (isMongoDBConfigured()) {
      await connectToDatabase();

      const query: any = {};
      if (customerId) query.customerId = customerId;
      if (status && status !== 'all') query.orderStatus = status;

      const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        count: orders.length,
        data: orders.map((o: any) => ({
          ...o,
          id: o._id.toString(),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (isMongoDBConfigured()) {
      await connectToDatabase();

      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `SE-${randomDigits}`;

      // Deduct stock atomically for each ordered product
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          if (item.productId) {
            await Product.findOneAndUpdate(
              { _id: item.productId, stockQuantity: { $gte: item.quantity } },
              { $inc: { stockQuantity: -item.quantity } }
            );
          }
        }
      }

      const newOrder = await Order.create({
        ...body,
        orderNumber,
        currency: 'NGN',
      });

      // Update customer total orders & total spent
      if (body.customerEmail) {
        await User.findOneAndUpdate(
          { email: body.customerEmail.toLowerCase() },
          {
            $inc: {
              totalOrders: 1,
              totalSpent: body.totalAmount || body.total || 0,
            },
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: newOrder,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...body,
        id: 'ord-' + Date.now().toString(36),
        orderNumber: `SE-${Math.floor(10000 + Math.random() * 90000)}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
