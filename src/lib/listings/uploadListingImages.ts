'use client';

import {
  ALLOWED_LISTING_IMAGE_TYPES,
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGE_SIZE_BYTES,
} from '@/lib/listings/schemas';

export type UploadedListingImage = {
  key: string;
  url: string;
};

type PresignListingImageResponse = UploadedListingImage & {
  uploadUrl: string;
};

function getUploadErrorMessage(status: number): string {
  if (status === 401) return 'Please sign in again before uploading images.';
  if (status === 400) {
    return 'Some images are invalid. Use JPEG or PNG files up to 10MB.';
  }
  return 'Could not prepare image upload. Please try again.';
}

function assertListingImageFile(file: File) {
  if (
    !ALLOWED_LISTING_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_LISTING_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error('Only JPEG and PNG images are allowed.');
  }

  if (file.size > MAX_LISTING_IMAGE_SIZE_BYTES) {
    throw new Error('Each image must be 10MB or smaller.');
  }
}

function assertListingImageBatch(files: File[]) {
  if (files.length < 1) {
    throw new Error('Add at least one image.');
  }

  if (files.length > MAX_LISTING_IMAGES) {
    throw new Error(`You can upload up to ${MAX_LISTING_IMAGES} images.`);
  }
}

export async function presignListingImage(
  file: File,
): Promise<PresignListingImageResponse> {
  assertListingImageFile(file);

  const response = await fetch('/api/uploads/listings-image/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!response.ok) {
    throw new Error(getUploadErrorMessage(response.status));
  }

  return (await response.json()) as PresignListingImageResponse;
}

export async function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
  });

  if (!response.ok) {
    throw new Error('Image upload failed. Please retry.');
  }
}

export async function uploadListingImagesInOrder(
  files: File[],
): Promise<UploadedListingImage[]> {
  assertListingImageBatch(files);

  const uploaded: UploadedListingImage[] = [];

  for (const file of files) {
    const { key, url, uploadUrl } = await presignListingImage(file);
    await putFileToPresignedUrl(uploadUrl, file);
    uploaded.push({ key, url });
  }

  return uploaded;
}
