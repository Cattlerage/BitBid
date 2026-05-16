import { z } from 'zod';

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

export const ListingCategorySchema = z.enum(ListingCategoryValues);

export const ListingImageInputSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
});

export const CreateListingServerSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  category: ListingCategorySchema,
  startingBid: z.coerce.number().int().min(1),
  images: z.array(ListingImageInputSchema).min(1).max(8),
});
