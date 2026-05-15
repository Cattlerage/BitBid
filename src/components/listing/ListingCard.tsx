import Link from 'next/link';
import LiveCountdown from '@/components/listing/LiveCountdown';
import type { ListingStatus } from '@/generated/prisma/enums';
import Image from 'next/image';

type ListingCardProps = {
  title: string;
  href: string;
  currentBid: number;
  bidCount: number;
  endTime: Date | null;
  status: ListingStatus;
  imageSrc: string;
  variant?: 'default' | 'compact';
};

function formatCurrency(amount: number) {
  const number = new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${number}\u00A0TL`;
}

function getStatusLabel(status: ListingStatus) {
  if (status === 'LIVE') return 'LIVE';
  if (status === 'ACTIVE') return 'ACTIVE';
  if (status === 'ENDED') return 'ENDED';
  if (status === 'CANCELLED') return 'CANCELLED';
  return 'DRAFT';
}

export default function ListingCard({
  title,
  href,
  currentBid,
  bidCount,
  endTime,
  status,
  imageSrc,
  variant = 'default',
}: ListingCardProps) {
  const isLive = status === 'LIVE';
  const compact = variant === 'compact';

  return (
    <Link
      href={href}
      className={`block no-underline text-inherit outline-none ring-offset-background cursor-pointer focus-visible:ring-2 focus-visible:ring-ring ${
        compact
          ? 'w-full'
          : 'w-66 shrink-0 md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]'
      }`}
    >
      <div
        className={`bg-card rounded-md flex flex-col text-white border border-outline relative overflow-hidden group ${
          compact ? 'p-2.5' : 'p-4'
        }`}
      >
        <div className='absolute inset-0 bg-gradient-to-b to-transparent pointer-events-none rounded-md' />

        <div
          className={`relative w-full aspect-square rounded-md flex items-center justify-center overflow-hidden ${
            compact ? 'mb-2' : 'mb-4'
          }`}
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes={
              compact
                ? '(max-width: 768px) 48vw, (max-width: 1024px) 31vw, (max-width: 1280px) 23vw, 16vw'
                : '(max-width: 768px) 264px, (max-width: 1024px) 33vw, 25vw'
            }
            className='object-cover rounded-md'
          />

          <div
            className={`absolute left-2 bottom-2 bg-[#121418]/80 backdrop-blur-md border border-gray-700 rounded-md flex items-center gap-1.5 ${
              compact
                ? 'px-1.5 py-0.5 text-[10px] font-semibold'
                : 'px-2.5 py-1.5 text-2xs font-bold'
            }`}
          >
            {isLive ? (
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75' />
                <span className='relative inline-flex rounded-full h-2 w-2 bg-red-600' />
              </span>
            ) : (
              <span className='inline-flex h-2 w-2 rounded-full bg-green-400' />
            )}
            {getStatusLabel(status)}
          </div>
        </div>

        <h3
          className={`font-medium leading-snug text-white ${
            compact
              ? 'text-xs mb-1.5 line-clamp-1'
              : 'text-sm mb-3 line-clamp-2'
          }`}
        >
          {title}
        </h3>

        <div className={compact ? 'mb-2' : 'mb-4'}>
          <div className='flex items-baseline gap-1.5'>
            <span
              className={`text-[#e2b054] font-semibold tracking-wider ${
                compact ? 'text-[10px]' : 'text-xs'
              }`}
            >
              BID:
            </span>
            <span
              className={`text-[#e2b054] font-bold ${compact ? 'text-base' : 'text-xl'}`}
            >
              {formatCurrency(currentBid)}
            </span>
          </div>
          <span
            className={`text-grey ${compact ? 'text-[11px]' : 'text-xs mt-0.5'}`}
          >
            {bidCount} bids
          </span>
        </div>

        <div
          className={`text-grey flex items-center gap-1 ${
            compact ? 'mb-2 text-[11px]' : 'mb-5 text-xs'
          }`}
        >
          {isLive && endTime ? (
            <div>
              <span className='tracking-wide uppercase'>Ends:</span>
              <LiveCountdown
                endAt={endTime}
                mode='tokens'
                className={
                  compact
                    ? 'font-mono text-[11px] text-white'
                    : 'font-mono text-sm font-semibold text-white'
                }
              />
            </div>
          ) : (
            <span className='font-medium text-transparent'>-</span>
          )}
        </div>

        <div
          className={`w-full bg-gradient-to-r from-[#ff8c00] to-[#ffaa00] text-background font-bold rounded-md text-center ${
            compact ? 'py-2 text-xs' : 'py-3.5'
          }`}
        >
          {compact ? 'BID' : isLive ? 'PLACE BID' : 'BE FIRST BID'}
        </div>
      </div>
    </Link>
  );
}
