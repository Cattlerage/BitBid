import Link from 'next/link';
import CategoryBar from '@/components/layout/CategoryBar';
import ListingCard from '@/components/listing/ListingCard';
import prisma from '@/lib/prisma';

export default async function Home() {
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
      _count: {
        select: { bids: true },
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
          <Link
            href='/listings'
            className='text-sm text-primary hover:underline'
          >
            See all
          </Link>
        </div>

        <div className='px-4 overflow-x-auto md:overflow-x-hidden hide-scrollbar'>
          <div className='flex w-max flex-nowrap gap-4 md:w-full md:gap-6'>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                title={listing.title}
                href={`/listings/${listing.id}`}
                currentBid={listing.currentBid}
                bidCount={listing._count.bids}
                endTime={listing.endTime}
                status={listing.status}
                imageSrc='/rolex.png'
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
