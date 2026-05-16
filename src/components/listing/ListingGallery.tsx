'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type ListingGalleryProps = {
  title: string;
  images: string[];
  isLive: boolean;
};

export default function ListingGallery({
  title,
  images,
  isLive,
}: ListingGalleryProps) {
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (galleryImages.length === 0) {
    return (
      <div className='overflow-hidden md:bg-transparent md:p-3'>
        <div className='relative aspect-square w-full overflow-hidden rounded-md border border-outline bg-card'>
          <div className='absolute inset-0 flex items-center justify-center text-sm text-grey'>
            No photos yet
          </div>
        </div>
      </div>
    );
  }

  const activeImage = galleryImages[activeImageIdx] ?? galleryImages[0];
  const canNavigate = galleryImages.length > 1;

  const selectPrev = () => {
    if (!canNavigate) return;
    setActiveImageIdx((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );
  };

  const selectNext = () => {
    if (!canNavigate) return;
    setActiveImageIdx((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className='overflow-hidden md:bg-transparent md:p-3'>
      <div className='md:hidden'>
        <div className='relative aspect-square w-full overflow-hidden bg-transparent'>
          <Image
            src={activeImage}
            alt={title}
            fill
            sizes='(max-width: 768px) 100vw, 60vw'
            className='object-cover object-top'
          />

          {canNavigate ? (
            <>
              <button
                type='button'
                onClick={selectPrev}
                className='absolute top-1/2 left-2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-white backdrop-blur-sm transition hover:bg-background'
                aria-label='Previous image'
              >
                <ChevronLeft className='h-5 w-5' />
              </button>
              <button
                type='button'
                onClick={selectNext}
                className='absolute top-1/2 right-2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-white backdrop-blur-sm transition hover:bg-background'
                aria-label='Next image'
              >
                <ChevronRight className='h-5 w-5' />
              </button>
            </>
          ) : null}

          {isLive ? (
            <div className='absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-outline bg-background/85 px-2 py-1 text-2xs font-bold backdrop-blur-md'>
              <span className='relative flex h-2.5 w-2.5'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75' />
                <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600' />
              </span>
              LIVE
            </div>
          ) : null}
        </div>

        {canNavigate ? (
          <div className='mt-2 text-center text-2xs text-grey'>
            {activeImageIdx + 1} / {galleryImages.length}
          </div>
        ) : null}

        <div className='hide-scrollbar mt-3 mx-2 flex gap-2 overflow-x-auto pb-1'>
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type='button'
              onClick={() => setActiveImageIdx(index)}
              className={cn(
                'h-20 w-20 shrink-0 overflow-hidden border transition',
                index === activeImageIdx
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-outline hover:border-muted-foreground',
              )}
              aria-label={`Select image ${index + 1}`}
              aria-current={index === activeImageIdx ? 'true' : 'false'}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className='h-full w-full object-cover'
              />
            </button>
          ))}
        </div>
      </div>

      <div className='hidden gap-4 md:flex'>
        <div className='flex shrink-0 flex-col gap-2'>
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type='button'
              onClick={() => setActiveImageIdx(index)}
              className={cn(
                'h-20 w-20 shrink-0 overflow-hidden border transition',
                index === activeImageIdx
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-outline hover:border-muted-foreground',
              )}
              aria-label={`Select image ${index + 1}`}
              aria-current={index === activeImageIdx ? 'true' : 'false'}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className='h-full w-full object-cover'
              />
            </button>
          ))}
        </div>

        <div className='relative min-h-0 flex-1'>
          <div className='relative aspect-square w-full overflow-hidden bg-transparent'>
            <Image
              src={activeImage}
              alt={title}
              fill
              sizes='(max-width: 768px) 100vw, 60vw'
              className='object-cover object-top'
            />

            {canNavigate ? (
              <>
                <button
                  type='button'
                  onClick={selectPrev}
                  className='absolute top-1/2 left-3 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-white backdrop-blur-sm transition hover:bg-background'
                  aria-label='Previous image'
                >
                  <ChevronLeft className='h-5 w-5' />
                </button>
                <button
                  type='button'
                  onClick={selectNext}
                  className='absolute top-1/2 right-3 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-white backdrop-blur-sm transition hover:bg-background'
                  aria-label='Next image'
                >
                  <ChevronRight className='h-5 w-5' />
                </button>
              </>
            ) : null}

            {isLive ? (
              <div className='absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-outline bg-background/80 px-2.5 py-1.5 text-2xs font-bold backdrop-blur-md'>
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75' />
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600' />
                </span>
                LIVE
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
