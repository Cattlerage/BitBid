import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { s3 } from '@/lib/s3';

export const runtime = 'nodejs';

type Ctx = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_req: Request, { params }: Ctx) {
  const { key } = await params;
  const objectKey = key.map(decodeURIComponent).join('/');

  if (!objectKey) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    const obj = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: objectKey,
      }),
    );

    const body = obj.Body as { transformToWebStream?: () => ReadableStream };
    if (!body?.transformToWebStream) {
      return NextResponse.json({ error: 'No object body' }, { status: 404 });
    }

    return new Response(body.transformToWebStream(), {
      headers: {
        'Content-Type': obj.ContentType ?? 'application/octet-stream',
        'Cache-Control':
          'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: unknown) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      '$metadata' in error &&
      typeof (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 'number'
        ? (error as { $metadata: { httpStatusCode: number } }).$metadata
            .httpStatusCode
        : 500;

    if (status === 404) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 },
    );
  }
}
