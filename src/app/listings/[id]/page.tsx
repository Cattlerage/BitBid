import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { History, ShieldCheck, Star } from 'lucide-react';

import CategoryBar from '@/components/layout/CategoryBar';
import ListingGallery from '@/components/listing/ListingGallery';
import ListingBidForm from '@/components/listing/ListingBidForm';
import prisma from '@/lib/prisma';
import type { ListingStatus } from '@/generated/prisma/enums';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatCurrency(amount: number) {
  const number = new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${number}\u00A0TL`;
}

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(d);
}

function formatTimeLeft(endTime: Date | null) {
  if (!endTime) return 'No countdown yet';

  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return 'Ended';

  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function statusLabel(status: ListingStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'LIVE':
      return 'Live';
    case 'DRAFT':
      return 'Draft';
    case 'ENDED':
      return 'Ended';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!listing) {
    return { title: 'Listing not found | BitBid' };
  }

  return {
    title: `${listing.title} | BitBid`,
    description: `Auction on BitBid: ${listing.title}`,
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: { bids: true },
      },
      bids: {
        take: 15,
        orderBy: { amount: 'desc' },
        include: {
          bidder: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const moreFromSeller = await prisma.listing.findMany({
    where: {
      sellerId: listing.sellerId,
      id: { not: listing.id },
      status: { in: ['ACTIVE', 'LIVE'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      _count: {
        select: { bids: true },
      },
    },
  });

  const hasCountdown = listing.status === 'LIVE' && !!listing.endTime;
  const isLive = hasCountdown;

  const isBiddable =
    listing.status === 'ACTIVE' ||
    (listing.status === 'LIVE' && !!listing.endTime);

  const minNextBid = Math.max(listing.currentBid + 1, listing.startingBid + 1);

  return (
    <main className='min-h-screen bg-background pt-30 font-sans text-white md:pt-16'>
      <div className='sticky top-28.5 z-40 border-b border-outline bg-background md:top-16'>
        <CategoryBar />
      </div>

      <div className='mx-auto w-full max-w-360 px-3 py-5 pb-28 md:px-4 md:py-8 md:pb-8'>
        <div className='mb-4 hidden flex-wrap items-center gap-1.5 text-xs text-grey md:mb-6 md:flex md:gap-2'>
          <span>BitBid</span>
          <span>›</span>
          <span>{listing.category}</span>
          <span>›</span>
          <span className='max-w-[58vw] truncate font-medium text-white md:max-w-none'>
            {listing.title}
          </span>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10'>
          <section className='lg:col-span-7'>
            <div className='-mx-3 md:mx-0'>
              <ListingGallery
                title={listing.title}
                isLive={isLive}
                images={['/rolex.png', '/rolex.png', '/rolex.png']}
              />
            </div>
          </section>

          <section className='lg:col-span-5'>
            <h1 className='mb-2 text-2xl leading-tight font-bold md:text-3xl'>
              {listing.title}
            </h1>

            <div className='mb-5 flex flex-wrap items-center gap-2'>
              <Badge variant='outline' className='border-outline text-grey'>
                {listing.category}
              </Badge>
              <Badge variant='outline' className='border-outline text-grey'>
                {statusLabel(listing.status)}
              </Badge>
              <span className='text-xs text-grey'>
                {listing.endTime
                  ? `Ends ${formatDateTime(listing.endTime)}`
                  : 'Countdown starts after first bid'}
              </span>
            </div>

            <ListingBidForm
              listingId={listing.id}
              isLive={isBiddable}
              minNextBid={minNextBid}
              minNextBidLabel={formatCurrency(minNextBid)}
              currentBidLabel={formatCurrency(listing.currentBid)}
              timeLeftLabel={formatTimeLeft(listing.endTime)}
              endsAtLabel={
                listing.endTime
                  ? formatDateTime(listing.endTime)
                  : 'Starts after first bid'
              }
              bidCount={listing._count.bids}
            />

            <div className='mb-6 md:mb-8'>
              <div className='mb-3 flex items-center gap-2'>
                <History className='h-4 w-4 text-grey' />
                <h3 className='font-semibold'>Last 15 Bids</h3>
              </div>

              <Card className='overflow-hidden border-outline py-0'>
                <div className='max-h-64 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                  <div className='divide-y divide-outline'>
                    {listing.bids.length > 0 ? (
                      listing.bids.map((bid) => (
                        <div
                          key={bid.id}
                          className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_auto]'
                        >
                          <div className='min-w-0 flex items-center gap-3'>
                            <Avatar className='h-8 w-8 border border-outline bg-muted'>
                              <AvatarFallback className='bg-muted text-xs font-bold text-white'>
                                {getInitials(bid.bidder.name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className='min-w-0'>
                              <div className='truncate text-sm text-grey'>
                                {bid.bidder.name}
                              </div>
                              <div className='text-xs text-grey'>
                                {formatDateTime(bid.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div className='text-sm font-semibold text-white'>
                            {formatCurrency(bid.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='px-4 py-6 text-sm text-grey'>
                        No bids yet. Be the first one.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <Separator className='my-6 bg-outline' />

            <div className='mb-8'>
              <h3 className='mb-4 text-lg font-semibold'>Description</h3>
              <div className='text-sm'>
                <div className='font-medium leading-relaxed whitespace-pre-wrap'>
                  {listing.description}
                </div>
              </div>
            </div>

            <Separator className='my-6 bg-outline' />

            <div className='mb-8'>
              <h3 className='mb-4 text-lg font-semibold'>Details</h3>
              <div className='grid grid-cols-[96px_1fr] gap-y-3 text-sm sm:grid-cols-[120px_1fr]'>
                <div className='text-grey'>Category</div>
                <div className='font-medium'>{listing.category}</div>

                <div className='text-grey'>Status</div>
                <div className='font-medium'>{statusLabel(listing.status)}</div>

                <div className='text-grey'>Posted</div>
                <div className='font-medium'>
                  {formatDateTime(listing.createdAt)}
                </div>
              </div>
            </div>

            <Separator className='my-6 bg-outline' />

            <div className='mb-6'>
              <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='group flex cursor-pointer items-center gap-3 md:gap-4'>
                  <Avatar className='h-14 w-14 border border-outline bg-muted'>
                    <AvatarFallback className='bg-muted font-bold text-white'>
                      {getInitials(listing.seller.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className='text-lg font-bold group-hover:underline'>
                      {listing.seller.name}
                    </h3>
                    <div className='mt-1 flex items-center gap-1 text-sm'>
                      <div className='flex text-[#e2b054]'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className='h-3.5 w-3.5 fill-current' />
                        ))}
                      </div>
                      <span className='ml-1 text-xs text-grey'>
                        Trusted seller
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-4 flex flex-wrap items-center gap-4 text-sm md:gap-6'>
                <div>
                  <span className='font-bold'>{moreFromSeller.length}</span>{' '}
                  <span className='text-grey'>active listings</span>
                </div>
                <div className='inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400'>
                  <ShieldCheck className='h-4 w-4' />
                  Profile verified
                </div>
              </div>
            </div>

            <Separator className='my-6 bg-outline' />

            <div className='rounded-md border border-outline bg-card p-4'>
              <div className='flex items-start gap-3'>
                <ShieldCheck className='mt-0.5 h-5 w-5 text-primary' />
                <div>
                  <h4 className='font-bold'>BitBid Buyer Protection</h4>
                  <p className='mt-1 text-sm text-grey'>
                    Receive your item as described, or get your money back.
                    <Link
                      href='/'
                      className='ml-1 text-primary hover:underline'
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className='mt-10 border-t border-outline pt-6 md:mt-14 md:pt-8'>
          <div className='mb-4 flex items-center justify-between md:mb-6'>
            <h2 className='text-xl font-bold'>More from this seller</h2>
            <Button asChild variant='link' className='text-primary'>
              <Link href='/'>See all</Link>
            </Button>
          </div>

          {moreFromSeller.length > 0 ? (
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
              {moreFromSeller.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className='group'
                >
                  <div className='relative mb-3 aspect-square overflow-hidden rounded-md border border-outline bg-card'>
                    <Image
                      src='/rolex.png'
                      alt={item.title}
                      fill
                      sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw'
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>
                  <h3 className='mb-1 line-clamp-2 text-sm text-grey group-hover:text-white'>
                    {item.title}
                  </h3>
                  <p className='text-sm font-bold text-white'>
                    Current {formatCurrency(item.currentBid)}
                  </p>
                  <p className='text-2xs text-grey'>{item._count.bids} bids</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className='text-sm text-grey'>No other active listings yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
