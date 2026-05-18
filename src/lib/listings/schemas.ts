import { z } from 'zod';

export const LISTING_TITLE_MIN = 3;
export const LISTING_TITLE_MAX = 120;
export const LISTING_DESCRIPTION_MIN = 10;
export const LISTING_DESCRIPTION_MAX = 5000;
export const MAX_LISTING_IMAGES = 20;
export const MAX_LISTING_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_LISTING_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;

export const ListingCategoryValues = [
  'Car',
  'Men',
  'Women',
  'Electronics',
  'Gaming',
  'Home',
  'Handmade',
  'Office',
  'Outdoor',
  'Sports',
  'Kids',
  'Books',
  'Shoes',
  'Pets',
  'Garden',
  'Other',
] as const;

export const ListingIdSchema = z.string().uuid();
export const ListingCategorySchema = z.enum(ListingCategoryValues);
export const ListingTitleSchema = z
  .string()
  .trim()
  .min(LISTING_TITLE_MIN, 'Title must be at least 3 characters.')
  .max(LISTING_TITLE_MAX, 'Title can be at most 120 characters.');
export const ListingDescriptionSchema = z
  .string()
  .trim()
  .min(LISTING_DESCRIPTION_MIN, 'Description must be at least 10 characters.')
  .max(
    LISTING_DESCRIPTION_MAX,
    'Description can be at most 5,000 characters.',
  );
export const StartingBidSchema = z.coerce
  .number()
  .int('Starting bid must be a whole number.')
  .min(1, 'Starting bid must be at least 1.');

export const ListingImageInputSchema = z.object({
  key: z.string().min(1, 'Invalid image key.'),
  url: z.string().url('Invalid image URL.'),
});

export const CreateListingFormSchema = z.object({
  title: ListingTitleSchema,
  description: ListingDescriptionSchema,
  category: ListingCategorySchema,
  startingBid: StartingBidSchema,
});

export const CreateListingServerSchema = CreateListingFormSchema.extend({
  images: z
    .array(ListingImageInputSchema)
    .min(1, 'Add at least one image.')
    .max(MAX_LISTING_IMAGES, `You can upload up to ${MAX_LISTING_IMAGES} images.`),
});

export const PresignListingImageSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
  contentType: z.enum(ALLOWED_LISTING_IMAGE_TYPES, {
    message: 'Only JPEG and PNG images are allowed.',
  }),
  size: z
    .number()
    .int()
    .positive()
    .max(
      MAX_LISTING_IMAGE_SIZE_BYTES,
      `Each image must be ${Math.floor(MAX_LISTING_IMAGE_SIZE_BYTES / (1024 * 1024))}MB or smaller.`,
    ),
});

export const DeleteListingSchema = z.object({
  listingId: ListingIdSchema,
});

export type CreateListingFormInput = z.infer<typeof CreateListingFormSchema>;
export type CreateListingServerInput = z.infer<typeof CreateListingServerSchema>;
