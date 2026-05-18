'use server';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CreateListingServerSchema } from '@/lib/listings/schemas';
import { firstZodIssueMessage } from '@/lib/zod/errors';
import { getAuthUser } from '@/lib/auth/session';
import { canCreateListing } from '@/lib/auth/policies';

export async function createListing(formData: FormData) {
  const user = await getAuthUser();
  const policy = canCreateListing(user);
  if (!policy.allowed) {
    throw new Error(policy.message);
  }
  if (!user) {
    throw new Error('Sign in to create a listing.');
  }

  const rawImages = String(formData.get('images') ?? '[]');

  let imagesJson: unknown;
  try {
    imagesJson = JSON.parse(rawImages);
  } catch {
    throw new Error('Invalid image payload');
  }

  const parsed = CreateListingServerSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    startingBid: formData.get('startingBid'),
    images: imagesJson,
  });

  if (!parsed.success) {
    throw new Error(firstZodIssueMessage(parsed.error, 'Invalid listing input'));
  }

  const { title, description, category, startingBid, images } = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      category,
      startingBid,
      currentBid: startingBid,
      status: 'ACTIVE',
      endTime: null,
      sellerId: user.id,
      images: {
        create: images.map((img, i) => ({
          key: img.key,
          url: img.url,
          position: i,
        })),
      },
    },
    select: { id: true },
  });

  redirect(`/listings/${listing.id}`);
}
