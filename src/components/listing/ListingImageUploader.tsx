'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X } from 'lucide-react';

import {
  ALLOWED_LISTING_IMAGE_TYPES,
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGE_SIZE_BYTES,
} from '@/lib/listings/schemas';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type PendingListingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ListingImageUploaderProps = {
  value: PendingListingImage[];
  onChange: (images: PendingListingImage[]) => void;
  disabled?: boolean;
  error?: string | null;
};

function formatLimitMb(bytes: number) {
  return Math.floor(bytes / (1024 * 1024));
}

function SortableImageTile({
  image,
  isCover,
  disabled,
  onRemove,
}: {
  image: PendingListingImage;
  isCover: boolean;
  disabled: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={cn(
        'relative aspect-square cursor-grab overflow-hidden rounded-md border border-outline bg-card active:cursor-grabbing',
        isCover && 'ring-2 ring-primary',
        isDragging && 'opacity-70',
      )}
    >
      <Image
        src={image.previewUrl}
        alt={image.file.name}
        fill
        unoptimized
        className='object-contain'
      />

      <Button
        type='button'
        size='icon-xs'
        variant='secondary'
        disabled={disabled}
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onClick={onRemove}
        aria-label='Remove image'
        className='absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-black/70 text-white hover:bg-black'
      >
        <X />
      </Button>
    </div>
  );
}

export default function ListingImageUploader({
  value,
  onChange,
  disabled = false,
  error = null,
}: ListingImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewsRef = useRef<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 140, tolerance: 8 },
    }),
  );

  const accept = useMemo(() => ALLOWED_LISTING_IMAGE_TYPES.join(','), []);

  useEffect(() => {
    const nextPreviews = value.map((img) => img.previewUrl);
    const removed = previewsRef.current.filter(
      (preview) => !nextPreviews.includes(preview),
    );

    for (const preview of removed) {
      URL.revokeObjectURL(preview);
    }

    previewsRef.current = nextPreviews;
  }, [value]);

  useEffect(
    () => () => {
      for (const preview of previewsRef.current) {
        URL.revokeObjectURL(preview);
      }
    },
    [],
  );

  const addFiles = (files: FileList | null) => {
    if (!files?.length || disabled) return;

    setLocalError(null);

    const incoming = Array.from(files);
    const remainingSlots = MAX_LISTING_IMAGES - value.length;
    const accepted = incoming.slice(0, Math.max(remainingSlots, 0));

    if (remainingSlots <= 0) {
      setLocalError(`You can upload up to ${MAX_LISTING_IMAGES} images.`);
      return;
    }

    const next: PendingListingImage[] = [...value];

    for (const file of accepted) {
      if (
        !ALLOWED_LISTING_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_LISTING_IMAGE_TYPES)[number],
        )
      ) {
        setLocalError('Only JPEG and PNG images are allowed.');
        continue;
      }

      if (file.size > MAX_LISTING_IMAGE_SIZE_BYTES) {
        setLocalError(
          `Each image must be ${formatLimitMb(MAX_LISTING_IMAGE_SIZE_BYTES)}MB or smaller.`,
        );
        continue;
      }

      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    onChange(next);
  };

  const removeImage = (id: string) => {
    const next = value.filter((img) => img.id !== id);
    onChange(next);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = value.findIndex((item) => item.id === active.id);
    const newIndex = value.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <div className='space-y-3'>
      <Label htmlFor='listing-images'>Images (1-{MAX_LISTING_IMAGES})</Label>

      <input
        ref={inputRef}
        id='listing-images'
        type='file'
        accept={accept}
        multiple
        disabled={disabled || value.length >= MAX_LISTING_IMAGES}
        onChange={(event) => addFiles(event.target.files)}
        className='hidden'
      />

      <div
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-label='Select listing images'
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-outline bg-card px-4 py-6 text-sm text-grey transition',
          isDragActive && 'border-primary text-white',
          disabled && 'cursor-not-allowed opacity-70',
        )}
      >
        <Upload className='size-4' />
        <span>Tap to choose or drag and drop images</span>
      </div>

      <p className='text-xs text-grey'>
        1-{MAX_LISTING_IMAGES} images, JPEG or PNG, max{' '}
        {formatLimitMb(MAX_LISTING_IMAGE_SIZE_BYTES)}MB each.
      </p>
      <p className='text-xs text-grey'>
        The first image is used as the cover photo.
      </p>

      {localError ? <p className='text-xs text-red-400'>{localError}</p> : null}
      {error ? <p className='text-xs text-red-400'>{error}</p> : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((image) => image.id)}
          strategy={rectSortingStrategy}
        >
          <div className='grid grid-cols-4 gap-2 sm:grid-cols-6'>
            {value.map((image, index) => (
              <SortableImageTile
                key={image.id}
                image={image}
                disabled={disabled}
                isCover={index === 0}
                onRemove={() => removeImage(image.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
