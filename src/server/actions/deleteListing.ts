'use server';

import prisma from '@/lib/prisma';
import { DeleteListingSchema } from '@/lib/listings/schemas';
import { s3 } from '@/lib/s3';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/auth/session';
import { canDeleteListing } from '@/lib/auth/policies';

export type DeleteListingState = {
  error?: string;
  success?: boolean;
} | null;

export async function deleteListing(
  _prev: DeleteListingState,
  formData: FormData,
): Promise<DeleteListingState> {
  const parsed = DeleteListingSchema.safeParse({
    listingId: formData.get('listingId'),
  });

  if (!parsed.success) {
    return { error: 'Invalid listing reference.' };
  }

  const { listingId } = parsed.data;
  const user = await getAuthUser();
  const basePolicy = canDeleteListing(user);
  if (!basePolicy.allowed) {
    return { error: basePolicy.message };
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        sellerId: true,
        images: {
          select: { key: true },
        },
      },
    });

    if (!listing) throw new Error('NOT_FOUND');
    const policy = canDeleteListing(user, { sellerId: listing.sellerId });
    if (!policy.allowed) {
      throw new Error(policy.code);
    }

    const imageKeys = listing.images
      .map((image) => image.key.trim())
      .filter((key) => key.length > 0);

    if (imageKeys.length > 0) {
      const deleted = await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.S3_BUCKET!,
          Delete: {
            Objects: imageKeys.map((Key) => ({ Key })),
            Quiet: true,
          },
        }),
      );

      if ((deleted.Errors?.length ?? 0) > 0) {
        throw new Error('S3_DELETE_FAILED');
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.bid.deleteMany({
        where: { listingId },
      });

      await tx.listing.delete({
        where: { id: listingId },
      });
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN';
    const map: Record<string, string> = {
      NOT_FOUND: 'Listing not found.',
      FORBIDDEN: 'You can only delete your own listings.',
      UNAUTHENTICATED: 'Sign in to delete this listing.',
      EMAIL_NOT_VERIFIED: 'Verify your email to continue.',
      S3_DELETE_FAILED:
        'Could not delete one or more listing images from storage.',
    };

    return { error: map[code] ?? 'Could not delete listing.' };
  }

  revalidatePath('/');
  revalidatePath('/listings');
  revalidatePath(`/listings/${listingId}`);

  return { success: true };
}
