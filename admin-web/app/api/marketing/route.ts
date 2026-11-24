import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { MarketingCampaign } from '../../../models/MarketingCampaign';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const campaigns = await MarketingCampaign.find().sort({ createdAt: -1 }).lean();

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        count: campaigns.length,
        data: campaigns.map((c: any) => ({
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const newCamp = await MarketingCampaign.create(body);
      return NextResponse.json({ success: true, data: newCamp });
    }

    return NextResponse.json({
      success: true,
      data: { ...body, id: 'camp-' + Date.now().toString(36) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
