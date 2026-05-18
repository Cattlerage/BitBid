'use client';

import { startTransition, useOptimistic, useState } from 'react';

import type { ListingStatus } from '@/generated/prisma/enums';
import ListingCard from '@/components/listing/ListingCard';

type ListingGridItem = {
  id: string;
  title: string;
  href: string;
  currentBid: number;
  bidCount: number;
  endTime: Date | null;
  status: ListingStatus;
  imageSrc: string;
  sellerId: string;
};

type ListingsGridClientProps = {
  initialListings: ListingGridItem[];
  currentUserId?: string;
  variant?: 'default' | 'compact';
  wrapperClassName: string;
  gridClassName: string;
};

export default function ListingsGridClient({
  initialListings,
  currentUserId,
  variant = 'default',
  wrapperClassName,
  gridClassName,
}: ListingsGridClientProps) {
  const [listings, setListings] = useState(initialListings);
  const [optimisticListings, removeOptimisticListing] = useOptimistic(
    listings,
    (current, listingId: string) =>
      current.filter((listing) => listing.id !== listingId),
  );

  const handleDeleted = (listingId: string) => {
    startTransition(() => {
      removeOptimisticListing(listingId);
      setListings((current) =>
        current.filter((listing) => listing.id !== listingId),
      );
    });
  };

  return (
    <div className={wrapperClassName}>
      <div className={gridClassName}>
        {optimisticListings.map((listing) => {
          const isOwner = currentUserId && listing.sellerId === currentUserId;

          return (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              href={listing.href}
              currentBid={listing.currentBid}
              bidCount={listing.bidCount}
              endTime={listing.endTime}
              status={listing.status}
              imageSrc={listing.imageSrc}
              variant={variant}
            />
          );
        })}
      </div>
    </div>
  );
}
