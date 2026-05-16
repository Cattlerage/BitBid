'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { createListing } from '@/server/actions/createListing';
import { ListingCategoryValues } from '@/lib/listings/schemas';
import { Button } from '@/components/ui/button';

type UploadedImage = {
  key: string;
  url: string;
  preview: string;
};

export default function CreateListingForm() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => !uploading && images.length > 0,
    [uploading, images.length],
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploadError(null);
    setUploading(true);

    try {
      const next = [...images];

      for (const file of Array.from(files)) {
        if (next.length >= 8) break;

        const presign = await fetch('/api/uploads/listings-image/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        if (!presign.ok) throw new Error('Could not prepare upload');
        const { uploadUrl, key, url } = await presign.json();

        const put = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
        });

        if (!put.ok) throw new Error('Upload failed');

        next.push({
          key,
          url,
          preview: URL.createObjectURL(file),
        });
      }

      setImages(next);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={createListing} className='flex flex-col gap-4'>
      <input
        name='title'
        placeholder='Title'
        className='bg-background border border-outline rounded px-3 py-2'
        required
      />

      <textarea
        name='description'
        placeholder='Description'
        className='bg-background border border-outline rounded px-3 py-2 min-h-28'
        required
      />

      <select
        name='category'
        className='bg-background border border-outline rounded px-3 py-2'
        defaultValue='Other'
        required
      >
        {ListingCategoryValues.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        name='startingBid'
        type='number'
        min={1}
        step={1}
        placeholder='Starting bid'
        className='bg-background border border-outline rounded px-3 py-2'
        required
      />

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Images (1-8)</label>
        <input
          type='file'
          accept='image/jpeg,image/png'
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className='block w-full text-sm'
        />
        {uploading ? <p className='text-xs text-grey'>Uploading...</p> : null}
        {uploadError ? (
          <p className='text-xs text-red-400'>{uploadError}</p>
        ) : null}
      </div>

      <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
        {images.map((img, i) => (
          <div
            key={img.key}
            className='relative aspect-square rounded border border-outline overflow-hidden'
          >
            <Image src={img.preview} alt='' fill className='object-cover' />
            <button
              type='button'
              onClick={() => removeImage(i)}
              className='absolute top-1 right-1 text-xs bg-black/70 rounded px-1.5 py-0.5'
            >
              x
            </button>
          </div>
        ))}
      </div>

      <input
        type='hidden'
        name='images'
        value={JSON.stringify(images.map(({ key, url }) => ({ key, url })))}
      />

      <p className='text-xs text-grey'>
        All auctions end next day at 9:00 PM after first bid.
      </p>

      <Button type='submit' disabled={!canSubmit}>
        {uploading ? 'Uploading...' : 'Create listing'}
      </Button>
    </form>
  );
}
