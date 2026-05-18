import Link from 'next/link';
import { auth } from '@/auth';
import CategoryBar from '@/components/layout/CategoryBar';
import ListingsGridClient from '@/components/listing/ListingsGridClient';
import prisma from '@/lib/prisma';
import type { ListingCategory } from '@/generated/prisma/enums';
import { listingImageSrcFromKey } from '@/lib/listings/imageSrc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 24;

const VALID_CATEGORIES: ListingCategory[] = [
  'Car',
  'Men',
  'Women',
  'Electronics',
  'Gaming',
  'Home',
  'Handmade',
  'Office',
  'Outdoor',
  'Sports',
  'Kids',
  'Books',
  'Shoes',
  'Pets',
  'Garden',
  'Other',
];

const VALID_SORTS = ['endingSoon', 'newest', 'priceHigh', 'priceLow'] as const;
type SortKey = (typeof VALID_SORTS)[number];

type PageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

function parsePage(raw?: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function parseSort(raw?: string): SortKey {
  if (raw && (VALID_SORTS as readonly string[]).includes(raw)) {
    return raw as SortKey;
  }
  return 'endingSoon';
}

function buildListingsUrl(opts: {
  q?: string;
  category?: string;
  sort?: SortKey;
  page?: number;
}) {
  const sp = new URLSearchParams();

  if (opts.q) sp.set('q', opts.q);
  if (opts.category) sp.set('category', opts.category);
  if (opts.sort && opts.sort !== 'endingSoon') sp.set('sort', opts.sort);
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page));

  const qs = sp.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  const q = params.q?.trim() ?? '';
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);
  const skip = (page - 1) * PAGE_SIZE;
  const now = new Date();

  const category = VALID_CATEGORIES.includes(params.category as ListingCategory)
    ? (params.category as ListingCategory)
    : undefined;

  const where = {
    AND: [
      {
        OR: [
          { status: 'ACTIVE' as const },
          { status: 'LIVE' as const, endTime: { gt: now } },
        ],
      },
      ...(category ? [{ category }] : []),
      ...(q
        ? [
            {
              OR: [
                { title: { contains: q, mode: 'insensitive' as const } },
                { description: { contains: q, mode: 'insensitive' as const } },
              ],
            },
          ]
        : []),
    ],
  };

  const orderBy =
    sort === 'newest'
      ? [{ createdAt: 'desc' as const }]
      : sort === 'priceHigh'
        ? [{ currentBid: 'desc' as const }]
        : sort === 'priceLow'
          ? [{ currentBid: 'asc' as const }]
          : [
              { status: 'desc' as const }, // LIVE first, then ACTIVE
              { endTime: 'asc' as const }, // among LIVE, ending soon first
              { createdAt: 'desc' as const },
            ];

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
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
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const title =
    q && category
      ? `"${q}" in ${category}`
      : q
        ? `Results for "${q}"`
        : category
          ? `${category} listings`
          : 'All listings';

  return (
    <main className='min-h-screen text-white font-sans pt-30 md:pt-16'>
      <div className='sticky top-28.5 md:top-16 z-40 border-b border-outline bg-background'>
        <CategoryBar />
      </div>

      <div className='max-w-350 mx-auto px-4 py-6'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-white'>{title}</h1>
            <p className='mt-1 text-sm text-grey'>
              {total} {total === 1 ? 'auction' : 'auctions'}
            </p>
          </div>
        </div>

        <div className='mb-6 flex flex-wrap items-center gap-2 text-xs'>
          {[
            { id: 'endingSoon', label: 'Ending soon' },
            { id: 'newest', label: 'Newest' },
            { id: 'priceHigh', label: 'Price high' },
            { id: 'priceLow', label: 'Price low' },
          ].map((item) => {
            const active = sort === item.id;
            return (
              <Button
                key={item.id}
                asChild
                variant={active ? 'default' : 'outline'}
                size='sm'
                className={`h-auto border px-3 py-1.5 text-xs ${
                  active
                    ? 'border-primary bg-primary text-background'
                    : 'border-outline bg-card text-grey hover:text-white'
                }`}
              >
                <Link
                  href={buildListingsUrl({
                    q: q || undefined,
                    category,
                    sort: item.id as SortKey,
                    page: 1,
                  })}
                >
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>

        {listings.length === 0 ? (
          <Card className='border-outline bg-card py-0'>
            <CardContent className='p-4'>
              <p className='text-grey'>No open auctions match your filters.</p>
            </CardContent>
          </Card>
        ) : (
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
            variant='compact'
            wrapperClassName='w-full'
            gridClassName='grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
          />
        )}

        {totalPages > 1 && (
          <Pagination className='mt-8'>
            <PaginationContent>
              <PaginationItem>
                {page > 1 ? (
                  <PaginationPrevious
                    href={buildListingsUrl({
                      q: q || undefined,
                      category,
                      sort,
                      page: page - 1,
                    })}
                  />
                ) : (
                  <PaginationLink
                    href={buildListingsUrl({
                      q: q || undefined,
                      category,
                      sort,
                      page: 1,
                    })}
                    className='pointer-events-none opacity-40'
                  >
                    Previous
                  </PaginationLink>
                )}
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href='#'
                  isActive
                  className='pointer-events-none'
                >
                  {page}/{totalPages}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                {page < totalPages ? (
                  <PaginationNext
                    href={buildListingsUrl({
                      q: q || undefined,
                      category,
                      sort,
                      page: page + 1,
                    })}
                  />
                ) : (
                  <PaginationLink
                    href={buildListingsUrl({
                      q: q || undefined,
                      category,
                      sort,
                      page,
                    })}
                    className='pointer-events-none opacity-40'
                  >
                    Next
                  </PaginationLink>
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </main>
  );
}
