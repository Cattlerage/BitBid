'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CreateListingServerSchema } from '@/lib/listings/schemas';

export async function createListing(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

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
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid listing input');
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
      sellerId: session.user.id,
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
