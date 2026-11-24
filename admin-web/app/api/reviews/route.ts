import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { ProductReview } from '../../../models/ProductReview';
import { AuditLog } from '../../../models/AuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const isApproved = searchParams.get('isApproved');

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectToDatabase();

    const query: any = {};
    if (productId) query.productId = productId;
    if (isApproved !== null && isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    const reviews = await ProductReview.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews.map((r: any) => ({
        ...r,
        id: r._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.productId || !body.customerName || !body.comment || !body.rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: { ...body, id: 'rev-' + Date.now() } });
    }

    await connectToDatabase();

    const created = await ProductReview.create({
      productId: body.productId,
      customerName: body.customerName,
      customerAvatar: body.customerAvatar,
      customerEmail: body.customerEmail,
      rating: Math.max(1, Math.min(5, Number(body.rating))),
      comment: body.comment,
      isVerifiedPurchase: body.isVerifiedPurchase ?? true,
      isApproved: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...created.toJSON(),
        id: created._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isApproved } = body;

    if (!id || isApproved === undefined) {
      return NextResponse.json({ error: 'Review ID and approval status required' }, { status: 400 });
    }

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const updated = await ProductReview.findByIdAndUpdate(id, { isApproved }, { new: true });

      await AuditLog.create({
        adminEmail: 'qazeembasitoladimeji@gmsail.com',
        adminName: 'Store Administrator',
        action: 'REVIEW_MODERATION',
        entityType: 'product',
        entityId: id,
        details: `Review ${id} moderated: isApproved set to ${isApproved}`,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      await ProductReview.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
