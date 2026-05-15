import prisma from '@/lib/prisma';

const DEFAULT_BATCH_SIZE = 100;

export type FinalizeEndedAuctionsResult = {
  scanned: number;
  finalized: number;
};

async function finalizeOneIfEnded(
  listingId: string,
  now: Date,
): Promise<boolean> {
  const finalized = await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, endTime: true, currentBid: true },
    });

    if (!listing) return false;
    if (listing.status !== 'LIVE') return false;
    if (!listing.endTime || listing.endTime > now) return false;

    // Winner = bidder on bid row that matches listing.currentBid
    const currentBidRow = await tx.bid.findFirst({
      where: {
        listingId,
        amount: listing.currentBid,
      },
      orderBy: { createdAt: 'desc' }, // latest matching bid wins
      select: { bidderId: true },
    });

    const updated = await tx.listing.updateMany({
      where: {
        id: listingId,
        status: 'LIVE',
        endTime: { lte: now },
      },
      data: {
        status: 'ENDED',
        winnerId: currentBidRow?.bidderId ?? null,
      },
    });

    return updated.count === 1;
  });

  return finalized;
}

export async function finalizeAuctions(
  batchSize = DEFAULT_BATCH_SIZE,
): Promise<FinalizeEndedAuctionsResult> {
  const now = new Date();

  const candidates = await prisma.listing.findMany({
    where: {
      status: 'LIVE',
      endTime: { lte: now },
    },
    select: { id: true },
    orderBy: { endTime: 'asc' },
    take: batchSize,
  });

  let finalized = 0;

  for (const candidate of candidates) {
    const didFinalize = await finalizeOneIfEnded(candidate.id, now);
    if (didFinalize) finalized += 1;
  }

  return {
    scanned: candidates.length,
    finalized,
  };
}
