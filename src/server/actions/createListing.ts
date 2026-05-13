'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

function getNextDay9PM(base = new Date()) {
  const end = new Date(base);
  end.setDate(end.getDate() + 1);
  end.setHours(21, 0, 0, 0);
  return end;
}

export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const seller = session.user;

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const startingBid = Number(formData.get('startingBid'));

  if (!title || !description || !Number.isFinite(startingBid)) {
    throw new Error('Invalid form input');
  }

  const endTime = getNextDay9PM();

  await prisma.listing.create({
    data: {
      title,
      description,
      startingBid,
      currentBid: startingBid,
      status: 'ACTIVE',
      endTime,
      sellerId: seller.id,
    },
  });
}
