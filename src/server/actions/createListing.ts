'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

function getNextDay9PM(base = new Date()) {
  const end = new Date(base);
  end.setDate(end.getDate() + 1);
  end.setHours(21, 0, 0, 0);
  return end;
}

export async function createListing(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const startingBid = Number(formData.get('startingBid'));

  // TODO: replace with real logged-in user id
  const sellerEmail = 'test-seller@bitbid.dev';

  if (!title || !description || !Number.isFinite(startingBid)) {
    throw new Error('Invalid form input');
  }

  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    update: {},
    create: { name: 'Test Seller', email: sellerEmail },
  });

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
