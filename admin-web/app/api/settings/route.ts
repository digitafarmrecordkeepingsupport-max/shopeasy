import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { StoreSettings } from '../../../models/StoreSettings';
import { AuditLog } from '../../../models/AuditLog';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  storeName: 'ShopEasy',
  storeEmail: 'qazeembasitoladimeji@gmsail.com',
  supportPhone: '+234 801 234 5678',
  currency: 'NGN',
  currencySymbol: '₦',
  deliveryFeeStandard: 2000,
  minFreeDeliveryThreshold: 50000,
  taxRatePercent: 0,
};

export async function GET(req: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
    }

    await connectToDatabase();

    let settings = await StoreSettings.findOne({}).lean();

    if (!settings) {
      const created = await StoreSettings.create(DEFAULT_SETTINGS);
      settings = created.toJSON();
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        id: (settings as any)._id?.toString() || 'default',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: body });
    }

    await connectToDatabase();

    const updated = await StoreSettings.findOneAndUpdate(
      {},
      {
        storeName: body.storeName,
        storeEmail: body.storeEmail,
        supportPhone: body.supportPhone,
        deliveryFeeStandard: Number(body.deliveryFeeStandard ?? 2000),
        minFreeDeliveryThreshold: Number(body.minFreeDeliveryThreshold ?? 50000),
        logoUrl: body.logoUrl,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      adminEmail: 'qazeembasitoladimeji@gmsail.com',
      adminName: 'Store Administrator',
      action: 'STORE_SETTINGS_UPDATED',
      entityType: 'settings',
      entityId: 'settings',
      details: `Settings updated: Name=${body.storeName}, DeliveryFee=${body.deliveryFeeStandard}, FreeThreshold=${body.minFreeDeliveryThreshold}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated.toJSON(),
        id: updated._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
