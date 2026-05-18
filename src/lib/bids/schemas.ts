import { z } from 'zod';
import { ListingIdSchema } from '@/lib/listings/schemas';

export const PlaceBidSchema = z.object({
  listingId: ListingIdSchema,
  amount: z.coerce.number().int().min(1, 'Enter a valid bid amount.'),
});

export function placeBidFormSchema(minNextBid: number) {
  return PlaceBidSchema.refine((data) => data.amount >= minNextBid, {
    path: ['amount'],
    message: `Bid must be at least ${minNextBid}.`,
  });
}

export type PlaceBidInput = z.infer<typeof PlaceBidSchema>;
