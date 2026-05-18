'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';

import LiveCountdown from '@/components/listing/LiveCountdown';
import type { ListingStatus } from '@/generated/prisma/enums';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ListingCardProps = {
  id?: string;
  title: string;
  href: string;
  currentBid: number;
  bidCount: number;
  endTime: Date | null;
  status: ListingStatus;
  imageSrc: string;
  variant?: 'default' | 'compact';
  action?: ReactNode;
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
  id,
  title,
  href,
  currentBid,
  bidCount,
  endTime,
  status,
  imageSrc,
  variant = 'default',
  action,
}: ListingCardProps) {
  const isLive = status === 'LIVE';
  const compact = variant === 'compact';
  const showCountdown = isLive && endTime;

  const ui = compact
    ? {
        container: 'h-full w-full min-w-0',
        link: 'block h-full w-full min-w-0',
        card: 'h-full rounded-xl border border-outline/80 bg-card p-2 shadow-none gap-0',
        imageWrap: 'mb-2 aspect-square rounded-lg',
        imageClass: 'rounded-lg object-contain',
        status: 'left-1.5 top-1.5 px-2 py-1 text-xs font-semibold leading-none',
        title: 'mb-1.5 min-h-8 line-clamp-2 text-xs font-semibold leading-4',
        bidMeta: 'mb-1.5 min-h-10',
        bidLabel: 'text-[9px] tracking-wide',
        bidValue: 'text-sm font-bold leading-tight',
        bidCount: 'text-[10px] text-grey',
        countdownWrap: 'mb-2 min-h-5 text-[10px] leading-tight',
        countdownValue: 'font-mono text-[11px] font-semibold text-white',
        button: 'rounded-md py-2 text-[11px] font-bold tracking-wide',
        cta: 'BID NOW',
        imageSizes:
          '(max-width: 640px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 20vw, 14vw',
      }
    : {
        container:
          'h-full w-[9.75rem] max-w-[42vw] shrink-0 snap-start sm:w-[10.5rem] md:w-full md:max-w-none',
        link: 'block h-full w-full',
        card: 'h-full rounded-lg border border-outline bg-card p-2.5 shadow-none gap-0',
        imageWrap: 'mb-2 aspect-square rounded-md',
        imageClass: 'rounded-md object-contain',
        status: 'left-2 top-2 px-2 py-1 text-xs font-semibold leading-none',
        title: 'mb-2 min-h-8 line-clamp-2 text-xs font-medium leading-snug',
        bidMeta: 'mb-2 min-h-10',
        bidLabel: 'text-[10px] tracking-wide',
        bidValue: 'text-base font-bold leading-tight',
        bidCount: 'text-[10px] text-grey',
        countdownWrap: 'mb-2.5 min-h-5 text-[10px] leading-tight',
        countdownValue: 'font-mono text-[11px] font-semibold text-white',
        button: 'rounded-md py-2 text-xs font-bold tracking-wide',
        cta: 'BID NOW',
        imageSizes: '(max-width: 768px) 168px, 200px',
      };

  return (
    <div className={ui.container} data-listing-id={id}>
      <Card
        className={cn(
          'relative flex h-full flex-col overflow-hidden text-white',
          ui.card,
        )}
      >
        <Link
          href={href}
          className={cn(
            'flex h-full flex-col cursor-pointer text-inherit no-underline outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring',
            ui.link,
          )}
        >
          <div className={cn('relative w-full overflow-hidden', ui.imageWrap)}>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={title}
                fill
                sizes={ui.imageSizes}
                className={ui.imageClass}
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center rounded-md bg-muted text-[10px] text-grey'>
                No image
              </div>
            )}

            <Badge
              className={cn(
                'absolute flex items-center gap-1 rounded border border-gray-700 bg-background text-white backdrop-blur-md ',
                ui.status,
              )}
            >
              {isLive ? (
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75' />
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-red-600' />
                </span>
              ) : (
                <span className='inline-flex h-1.5 w-1.5 rounded-full bg-green-400' />
              )}
              {getStatusLabel(status)}
            </Badge>
          </div>

          <h3 className={ui.title}>{title}</h3>

          <div className={ui.bidMeta}>
            <div className='flex min-w-0 flex-nowrap items-baseline gap-x-1'>
              <span
                className={cn(
                  'shrink-0 font-semibold text-[#e2b054]',
                  ui.bidLabel,
                )}
              >
                BID:
              </span>
              <span
                className={cn(
                  'min-w-0 truncate whitespace-nowrap font-bold text-[#e2b054]',
                  ui.bidValue,
                )}
              >
                {formatCurrency(currentBid)}
              </span>
            </div>
            <span className={ui.bidCount}>{bidCount} bids</span>
          </div>

          <div className={ui.countdownWrap}>
            {showCountdown ? (
              <div className='flex min-w-0 flex-nowrap items-baseline gap-x-1'>
                <span className='shrink-0 uppercase tracking-wide text-grey'>
                  Ends:
                </span>
                <LiveCountdown
                  endAt={endTime}
                  mode='tokens'
                  className={ui.countdownValue}
                />
              </div>
            ) : (
              <span className='text-grey/70'>No countdown</span>
            )}
          </div>

          <div
            className={cn(
              'mt-auto w-full bg-linear-to-r from-[#ff8c00] to-[#ffaa00] text-center text-background',
              ui.button,
            )}
          >
            {ui.cta}
          </div>
        </Link>

        {action ? <div className='mt-2'>{action}</div> : null}
      </Card>
    </div>
  );
}
