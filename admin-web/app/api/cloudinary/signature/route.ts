import { NextRequest, NextResponse } from 'next/server';
import { generateClientUploadSignature, isCloudinaryConfigured } from '../../../../lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are not configured.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'shopeasy/uploads';

    const signatureData = generateClientUploadSignature(folder);

    return NextResponse.json({
      success: true,
      ...signatureData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
