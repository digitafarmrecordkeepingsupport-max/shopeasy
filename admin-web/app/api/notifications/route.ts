import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { AppNotification } from '../../../models/AppNotification';
import { AuditLog } from '../../../models/AuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectToDatabase();

    const query: any = {};
    if (customerId) {
      query.$or = [{ customerId }, { audience: 'all' }];
    }

    const notifs = await AppNotification.find(query).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      success: true,
      count: notifs.length,
      data: notifs.map((n: any) => ({
        ...n,
        id: n._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
    }

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: { ...body, id: 'notif-' + Date.now() } });
    }

    await connectToDatabase();

    const created = await AppNotification.create({
      title: body.title.trim(),
      message: body.message.trim(),
      type: body.type || 'system',
      relatedId: body.relatedId,
      customerId: body.customerId,
      customerEmail: body.customerEmail,
      audience: body.audience || 'all',
      isRead: false,
    });

    await AuditLog.create({
      adminEmail: 'qazeembasitoladimeji@gmsail.com',
      adminName: 'Store Administrator',
      action: 'NOTIFICATION_BROADCAST',
      entityType: 'marketing',
      entityId: created._id.toString(),
      details: `Broadcast: "${body.title}" sent to audience: ${body.audience || 'all'}`,
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
