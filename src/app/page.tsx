import Link from 'next/link';

import { auth } from '@/auth';
import CategoryBar from '@/components/layout/CategoryBar';
import ListingsGridClient from '@/components/listing/ListingsGridClient';
import prisma from '@/lib/prisma';
import { listingImageSrcFromKey } from '@/lib/listings/imageSrc';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const session = await auth();

  const listings = await prisma.listing.findMany({
    where: {
      status: 'LIVE',
      endTime: { gt: new Date() },
    },
    orderBy: {
      endTime: 'asc',
    },
    take: 5,
    include: {
      seller: {
        select: { id: true },
      },
      _count: {
        select: { bids: true },
      },
      images: {
        orderBy: { position: 'asc' },
        take: 1,
      },
    },
  });

  return (
    <main className='min-h-screen text-white font-sans pt-30 md:pt-16'>
      <div className='sticky top-28.5 md:top-16 z-40 border-b border-outline bg-background'>
        <CategoryBar />
      </div>

      <div className='max-w-350 mx-auto flex flex-col'>
        <div className='px-4 mt-8 mb-4 flex items-center justify-between'>
          <h1 className='text-2xl text-grey font-bold'>Live now</h1>
          <Button
            asChild
            variant='link'
            className='h-auto p-0 text-sm text-primary'
          >
            <Link href='/listings'>See all</Link>
          </Button>
        </div>

        <div className='hide-scrollbar snap-x snap-mandatory overflow-x-auto px-4 pb-1 md:overflow-visible '>
          <ListingsGridClient
            initialListings={listings.map((listing) => ({
              id: listing.id,
              title: listing.title,
              href: `/listings/${listing.id}`,
              currentBid: listing.currentBid,
              bidCount: listing._count.bids,
              endTime: listing.endTime,
              status: listing.status,
              imageSrc: listing.images[0]?.key
                ? listingImageSrcFromKey(listing.images[0].key)
                : '',
              sellerId: listing.seller.id,
            }))}
            currentUserId={session?.user?.id}
            variant='default'
            wrapperClassName='w-max md:w-full'
            gridClassName='flex w-max flex-nowrap gap-3 md:grid md:w-full md:grid-cols-[repeat(auto-fill,minmax(11.5rem,13.25rem))] md:gap-4'
          />
        </div>
      </div>
    </main>
  );
}
