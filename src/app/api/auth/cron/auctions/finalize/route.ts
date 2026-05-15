import { NextResponse } from 'next/server';
import { finalizeAuctions } from '@/server/actions/finalizeAuctions';

export const runtime = 'nodejs';

const BATCH_SIZE = 100;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  const headerSecret = request.headers.get('x-cron-secret');

  return bearer === secret || headerSecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const maxLoops = 10;

  let totalScanned = 0;
  let totalFinalized = 0;
  let loops = 0;

  while (loops < maxLoops) {
    const result = await finalizeAuctions(BATCH_SIZE);
    totalScanned += result.scanned;
    totalFinalized += result.finalized;
    loops += 1;

    if (result.scanned < BATCH_SIZE) break;
  }

  return NextResponse.json({
    ok: true,
    loops,
    scanned: totalScanned,
    finalized: totalFinalized,
    at: new Date().toISOString(),
  });
}
