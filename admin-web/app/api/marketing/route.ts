import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConfigured } from '../../../lib/mongodb';
import { MarketingCampaign } from '../../../models/MarketingCampaign';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isMongoDBConfigured()) {
      await connectToDatabase();
      const campaigns = await MarketingCampaign.find().sort({ createdAt: -1 }).lean();

      if (campaigns.length > 0) {
        return NextResponse.json({
          success: true,
          count: campaigns.length,
          data: campaigns.map((c: any) => ({
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
          id: 'camp-1',
          name: 'Summer Sale',
          type: 'Discount',
          startDate: 'Jul 1, 2025',
          endDate: 'Jul 31, 2025',
          status: 'Active',
          thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400',
          discountRate: '30%',
          reach: 18400,
          clicks: 4920,
          conversions: 1240,
        },
      ],
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
