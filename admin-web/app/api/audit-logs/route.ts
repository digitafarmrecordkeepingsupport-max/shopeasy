import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { AuditLog } from '../../../models/AuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
    const entityType = searchParams.get('entityType');

    const filter: Record<string, any> = {};
    if (entityType && entityType !== 'all') {
      filter.entityType = entityType;
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: logs.map((log: any) => ({
        ...log,
        id: log._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminEmail, adminName, action, entityType, entityId, details } = body;

    if (!adminEmail || !action || !entityType || !details) {
      return NextResponse.json({ error: 'Missing required audit log fields' }, { status: 400 });
    }

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, message: 'Audit logged (offline)' });
    }

    await connectToDatabase();

    const log = await AuditLog.create({
      adminEmail,
      adminName: adminName || adminEmail.split('@')[0],
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        ...log.toObject(),
        id: log._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
