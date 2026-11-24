import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { Coupon } from '../../../models/Coupon';
import { AuditLog } from '../../../models/AuditLog';

export const dynamic = 'force-dynamic';

const DEFAULT_COUPONS = [
  {
    code: 'EASY10',
    type: 'percentage',
    value: 10,
    minSpend: 10000,
    description: '10% off on orders above ₦10,000',
    isActive: true,
  },
  {
    code: 'EASY20',
    type: 'percentage',
    value: 20,
    minSpend: 30000,
    description: '20% off on orders above ₦30,000',
    isActive: true,
  },
  {
    code: 'FREESHIP',
    type: 'free_delivery',
    value: 2000,
    minSpend: 15000,
    description: 'Free Delivery across Nigeria on orders above ₦15,000',
    isActive: true,
  },
  {
    code: 'WELCOME5000',
    type: 'fixed',
    value: 5000,
    minSpend: 25000,
    description: '₦5,000 flat discount on orders above ₦25,000',
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: DEFAULT_COUPONS });
    }

    await connectToDatabase();

    let coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

    if (coupons.length === 0) {
      await Coupon.insertMany(DEFAULT_COUPONS);
      coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({
      success: true,
      data: coupons.map((c: any) => ({
        ...c,
        id: c._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.code || !body.type || body.value === undefined) {
      return NextResponse.json({ error: 'Code, type, and value are required.' }, { status: 400 });
    }

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: body });
    }

    await connectToDatabase();

    const cleanCode = body.code.trim().toUpperCase();

    const created = await Coupon.findOneAndUpdate(
      { code: cleanCode },
      {
        code: cleanCode,
        type: body.type,
        value: Number(body.value),
        minSpend: Number(body.minSpend || 0),
        description: body.description || `${cleanCode} Promo`,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      adminEmail: 'qazeembasitoladimeji@gmsail.com',
      adminName: 'Store Administrator',
      action: 'COUPON_CREATED_OR_UPDATED',
      entityType: 'coupon',
      entityId: cleanCode,
      details: `Coupon ${cleanCode} (${body.type} - ${body.value}) saved.`,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      await Coupon.findOneAndDelete({ code: code.toUpperCase() });

      await AuditLog.create({
        adminEmail: 'qazeembasitoladimeji@gmsail.com',
        adminName: 'Store Administrator',
        action: 'COUPON_DELETED',
        entityType: 'coupon',
        entityId: code.toUpperCase(),
        details: `Coupon ${code.toUpperCase()} was deleted.`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
