import CategoryBar from '@/components/layout/CategoryBar';
import ListingCard from '@/components/listing/ListingCard';
import prisma from '@/lib/prisma';

export default async function Home() {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
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
      <div className='sticky top-28.5 md:top-16 z-40 border-b-1 border-outline bg-background'>
        <CategoryBar />
      </div>
      <div className='max-w-350 mx-auto flex flex-col'>
        <h1 className='px-4  mt-8 mb-4 text-2xl text-grey font-bold'>
          Ending soon
        </h1>

        <div className='px-4 overflow-x-auto md:overflow-x-hidden hide-scrollbar'>
          <div className='flex w-max flex-nowrap gap-4 md:w-full md:gap-6'>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                title={listing.title}
                currentBid={listing.currentBid}
                bidCount={listing._count.bids}
                endTime={listing.endTime}
                imageSrc='/rolex.png'
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
