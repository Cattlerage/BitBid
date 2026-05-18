'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createListing } from '@/server/actions/createListing';
import {
  CreateListingFormSchema,
  LISTING_DESCRIPTION_MAX,
  ListingCategoryValues,
  MAX_LISTING_IMAGES,
} from '@/lib/listings/schemas';
import {
  uploadListingImagesInOrder,
  type UploadedListingImage,
} from '@/lib/listings/uploadListingImages';
import { firstZodIssueMessage } from '@/lib/zod/errors';
import ListingImageUploader, {
  type PendingListingImage,
} from '@/components/listing/ListingImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function isNextRedirectError(error: unknown) {
  return error instanceof Error && error.message.includes('NEXT_REDIRECT');
}

export default function CreateListingForm() {
  const [pendingImages, setPendingImages] = useState<PendingListingImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('Other');

  const canSubmit = useMemo(
    () => !isSubmitting && pendingImages.length > 0,
    [isSubmitting, pendingImages.length],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    if (pendingImages.length === 0) {
      const message =
        'Please add at least one image before creating a listing.';
      setSubmitError(message);
      toast.error(message);
      return;
    }
    if (pendingImages.length > MAX_LISTING_IMAGES) {
      const message = `You can upload up to ${MAX_LISTING_IMAGES} images.`;
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const parsed = CreateListingFormSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      category,
      startingBid: formData.get('startingBid'),
    });

    if (!parsed.success) {
      const message = firstZodIssueMessage(parsed.error, 'Invalid listing input.');
      setSubmitError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedImages: UploadedListingImage[] =
        await uploadListingImagesInOrder(
          pendingImages.map((image) => image.file),
        );

      formData.set('images', JSON.stringify(uploadedImages));
      await createListing(formData);
    } catch (error) {
      if (isNextRedirectError(error)) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Could not create listing. Please try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  const [description, setDescription] = useState('');

  const descriptionLength = description.length;
  const atLimit = descriptionLength >= LISTING_DESCRIPTION_MAX;

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div className='space-y-2'>
        <Label htmlFor='listing-title'>Title</Label>
        <Input
          id='listing-title'
          name='title'
          placeholder='Title'
          className='border-outline bg-background'
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='listing-description'>Description</Label>
        <div className='relative'>
          <Textarea
            id='listing-description'
            name='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={LISTING_DESCRIPTION_MAX}
            placeholder={`Max ${LISTING_DESCRIPTION_MAX} characters`}
            className='min-h-28 resize-none overflow-y-auto border-outline bg-background field-sizing-content'
            required
          />
          <p
            className={`pointer-events-none absolute bottom-2 right-3 text-xs ${atLimit ? 'text-destructive' : 'text-muted-foreground'}`}
            aria-live='polite'
          >
            {descriptionLength.toLocaleString()} /{' '}
            {LISTING_DESCRIPTION_MAX.toLocaleString()}
          </p>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='listing-category'>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            id='listing-category'
            className='w-full border-outline bg-background'
          >
            <SelectValue placeholder='Select category' />
          </SelectTrigger>
          <SelectContent>
            {ListingCategoryValues.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type='hidden' name='category' value={category} />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='listing-starting-bid'>Starting bid</Label>
        <Input
          id='listing-starting-bid'
          name='startingBid'
          type='number'
          min={1}
          step={1}
          placeholder='Starting bid'
          className='border-outline bg-background'
          required
        />
      </div>

      <ListingImageUploader
        value={pendingImages}
        onChange={setPendingImages}
        disabled={isSubmitting}
        error={submitError}
      />

      <p className='text-xs text-grey'>
        All auctions end next day at 9:00 PM after first bid.
      </p>

      <Button type='submit' disabled={!canSubmit}>
        {isSubmitting ? 'Creating...' : 'Create listing'}
      </Button>
    </form>
  );
}
