import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  ALLOWED_LISTING_IMAGE_TYPES,
  PresignListingImageSchema,
} from '@/lib/listings/schemas';
import { getAuthUser } from '@/lib/auth/session';
import { canUploadListingImages } from '@/lib/auth/policies';

export const runtime = 'nodejs';

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const user = await getAuthUser();
  const policy = canUploadListingImages(user);
  if (!policy.allowed) {
    const status = policy.code === 'UNAUTHENTICATED' ? 401 : 403;
    return NextResponse.json({ error: policy.message }, { status });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = PresignListingImageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { fileName, contentType } = parsed.data;
  if (!ALLOWED_LISTING_IMAGE_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 },
    );
  }

  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
  const key = `listings/${user.id}/${crypto.randomUUID()}.${safeExt}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

    return NextResponse.json({ uploadUrl, key, url: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown S3 error';
    return NextResponse.json(
      { error: 'Failed to create presigned URL', detail: message },
      { status: 500 },
    );
  }
}
