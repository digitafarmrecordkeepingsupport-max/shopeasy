import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../../lib/mongodb';
import { Order } from '../../../../models/Order';
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
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { orderNumber: id };
      const order = await Order.findOne(query).lean();

      if (order) {
        return NextResponse.json({
          success: true,
          data: {
            ...order,
            id: (order as any)._id.toString(),
          },
        });
      }
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus } = body;

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { orderNumber: id };
      const existingOrder = await Order.findOne(query);

      if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // If status changed to cancelled from an active status, restore stock
      if (
        orderStatus === 'cancelled' &&
        existingOrder.orderStatus !== 'cancelled' &&
        existingOrder.items?.length
      ) {
        for (const item of existingOrder.items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stockQuantity: item.quantity },
            });
          }
        }
      }

      if (orderStatus) existingOrder.orderStatus = orderStatus;
      if (paymentStatus) existingOrder.paymentStatus = paymentStatus;

      await existingOrder.save();

      return NextResponse.json({ success: true, data: existingOrder });
    }

    return NextResponse.json({ success: true, message: 'Status updated (mock mode)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
