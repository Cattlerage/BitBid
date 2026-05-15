'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type PlaceBidState = { error?: string } | null;

function getNextDay9PM(base = new Date()) {
  const end = new Date(base);
  end.setDate(end.getDate() + 1);
  end.setHours(21, 0, 0, 0);
  return end;
}

export async function placeBid(
  _prev: PlaceBidState,
  formData: FormData,
): Promise<PlaceBidState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Sign in to place a bid.' };
  }
  const bidderId = session.user.id;

  const listingId = String(formData.get('listingId') ?? '').trim();
  const rawAmount = formData.get('amount');
  const amount =
    typeof rawAmount === 'string' && rawAmount !== ''
      ? parseInt(rawAmount, 10)
      : Number(rawAmount);

  if (!listingId || !Number.isInteger(amount) || amount < 1) {
    return { error: 'Enter a valid bid amount.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const now = new Date();

      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: {
          currentBid: true,
          startingBid: true,
          sellerId: true,
          status: true,
          endTime: true,
        },
      });

      if (!listing) throw new Error('LISTING_NOT_FOUND');
      if (listing.sellerId === bidderId) throw new Error('SELF_BID');
      if (listing.status !== 'ACTIVE' && listing.status !== 'LIVE') {
        throw new Error('NOT_OPEN');
      }

      // If it is LIVE but already expired, finalize immediately and reject bid.
      if (listing.status === 'LIVE') {
        if (!listing.endTime) throw new Error('NOT_OPEN');

        if (listing.endTime <= now) {
          const topBid = await tx.bid.findFirst({
            where: { listingId },
            orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
            select: { bidderId: true },
          });

          await tx.listing.updateMany({
            where: {
              id: listingId,
              status: 'LIVE',
              endTime: { lte: now },
            },
            data: {
              status: 'ENDED',
              winnerId: topBid?.bidderId ?? null,
            },
          });

          throw new Error('ENDED');
        }
      }

      const minBid = Math.max(listing.currentBid + 1, listing.startingBid + 1);
      if (amount < minBid) throw new Error('TOO_LOW');

      const transitioningToLive = listing.status === 'ACTIVE';
      const nextEndTime = transitioningToLive
        ? getNextDay9PM(now)
        : listing.endTime;

      const updated = await tx.listing.updateMany({
        where: {
          id: listingId,
          currentBid: listing.currentBid,
          sellerId: { not: bidderId },
          status: { in: ['ACTIVE', 'LIVE'] },
          OR: [{ status: 'ACTIVE' }, { status: 'LIVE', endTime: { gt: now } }],
        },
        data: {
          currentBid: amount,
          status: 'LIVE',
          endTime: nextEndTime,
        },
      });

      if (updated.count !== 1) throw new Error('STALE');

      await tx.bid.create({
        data: { listingId, bidderId, amount },
      });
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : 'UNKNOWN';
    const map: Record<string, string> = {
      LISTING_NOT_FOUND: 'Listing not found.',
      SELF_BID: "You can't bid on your own listing.",
      NOT_OPEN: "This auction isn't accepting bids.",
      ENDED: 'This auction has ended.',
      TOO_LOW: 'Your bid is too low.',
      STALE: 'Someone else bid first — refresh and try again.',
    };
    return { error: map[code] ?? 'Could not place bid.' };
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath('/');
  return null;
}
