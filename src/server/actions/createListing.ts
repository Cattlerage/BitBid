'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

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

  await prisma.listing.create({
    data: {
      title,
      description,
      startingBid,
      currentBid: startingBid,
      status: 'ACTIVE',
      endTime: null,
      sellerId: seller.id,
    },
  });
}
