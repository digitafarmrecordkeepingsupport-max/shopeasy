import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { SupportTicket } from '../../../models/SupportTicket';
import { AuditLog } from '../../../models/AuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectToDatabase();

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets.map((t: any) => ({
        ...t,
        id: t._id.toString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerName || !body.customerEmail || !body.subject || !body.description) {
      return NextResponse.json({ error: 'Name, email, subject, and description are required.' }, { status: 400 });
    }

    if (!isMongoDBConfigured()) {
      return NextResponse.json({ success: true, data: { ...body, id: 'tick-' + Date.now() } });
    }

    await connectToDatabase();

    const ticket = await SupportTicket.create({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      category: body.category || 'general',
      subject: body.subject,
      description: body.description,
      relatedOrderNumber: body.relatedOrderNumber,
      status: 'open',
    });

    return NextResponse.json({
      success: true,
      data: {
        ...ticket.toJSON(),
        id: ticket._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Ticket ID and status are required.' }, { status: 400 });
    }

    if (isMongoDBConfigured()) {
      await connectToDatabase();

      const updated = await SupportTicket.findByIdAndUpdate(
        id,
        {
          status,
          ...(adminNotes !== undefined ? { adminNotes } : {}),
        },
        { new: true }
      );

      await AuditLog.create({
        adminEmail: 'qazeembasitoladimeji@gmsail.com',
        adminName: 'Store Administrator',
        action: 'SUPPORT_TICKET_UPDATED',
        entityType: 'support',
        entityId: id,
        details: `Support ticket ${id} updated to status "${status}". Admin notes: ${adminNotes || 'none'}`,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
