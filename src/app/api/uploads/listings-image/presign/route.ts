import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const runtime = 'nodejs';

const bodySchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z
    .number()
    .int()
    .positive()
    .max(8 * 1024 * 1024), // 8MB
});

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { fileName, contentType } = parsed.data;
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 },
    );
  }

  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
  const key = `listings/${session.user.id}/${crypto.randomUUID()}.${safeExt}`;

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
