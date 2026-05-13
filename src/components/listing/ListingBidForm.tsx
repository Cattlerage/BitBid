'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Clock, Gavel } from 'lucide-react';

import { placeBid, type PlaceBidState } from '@/server/actions/placeBid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function SubmitBidButton({
  className,
  children,
  disabled,
}: {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type='submit'
      size='lg'
      disabled={disabled || pending}
      className={className}
    >
      {children}
    </Button>
  );
}

type Props = {
  listingId: string;
  isLive: boolean;
  minNextBid: number;
  minNextBidLabel: string;
  currentBidLabel: string;
  timeLeftLabel: string;
  endsAtLabel: string;
  bidCount: number;
};

export default function ListingBidForm({
  listingId,
  isLive,
  minNextBid,
  minNextBidLabel,
  currentBidLabel,
  timeLeftLabel,
  endsAtLabel,
  bidCount,
}: Props) {
  const [state, formAction] = useActionState(placeBid, null as PlaceBidState);

  return (
    <form action={formAction} className='contents'>
      <input type='hidden' name='listingId' value={listingId} />

      <Card className='mb-6 border-outline bg-card py-0 md:mb-8'>
        <CardContent className='p-4 md:p-6'>
          <div className='mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
            <div>
              <p className='text-grey mb-1 text-sm font-medium'>Current bid</p>
              <div className='text-[#e2b054] text-4xl font-extrabold'>
                {currentBidLabel}
              </div>
              <p className='text-grey mt-1 text-xs'>{bidCount} bids total</p>
            </div>

            <div className='flex flex-col gap-2 text-left sm:items-end sm:text-right'>
              <Badge className='bg-destructive/15 text-destructive border-0 px-3 py-1.5'>
                <Clock className='mr-1.5 h-4 w-4' />
                <span className='font-bold'>{timeLeftLabel}</span>
              </Badge>
              <p className='text-grey text-xs'>Ends {endsAtLabel}</p>
            </div>
          </div>

          <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:gap-3'>
            <div className='relative flex-1'>
              <Input
                name='amount'
                type='number'
                min={minNextBid}
                step={1}
                defaultValue={minNextBid}
                required
                disabled={!isLive}
                className='h-12 border-outline bg-background pl-3 text-base font-semibold'
              />
            </div>
            <SubmitBidButton
              disabled={!isLive}
              className='h-12 w-full bg-linear-to-r from-[#ff8c00] to-[#ffaa00] px-6 font-bold text-white hover:from-[#ff9900] hover:to-[#ffb732] sm:w-auto sm:px-8'
            >
              <Gavel className='mr-2 h-5 w-5' />
              Place Bid
            </SubmitBidButton>
          </div>

          <p className='text-grey text-center text-xs'>
            Enter {minNextBidLabel} or more
          </p>

          {state?.error ? (
            <p className='text-destructive mt-3 text-sm' role='alert'>
              {state.error}{' '}
              {state.error === 'Sign in to place a bid.' ? (
                <Link
                  href={`/auth/login?callbackUrl=/listings/${listingId}`}
                  className='text-primary underline underline-offset-2'
                >
                  Log in
                </Link>
              ) : null}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {isLive ? (
        <div className='fixed inset-x-0 bottom-0 z-50 border-t border-outline bg-background/95 p-3 backdrop-blur md:hidden'>
          <div className='mx-auto flex w-full max-w-360 items-center gap-3'>
            <div className='min-w-0'>
              <p className='text-2xs text-grey'>Current bid</p>
              <p className='text-[#e2b054] truncate text-lg font-extrabold'>
                {currentBidLabel}
              </p>
            </div>
            <SubmitBidButton className='ml-auto h-11 min-w-34 bg-linear-to-r from-[#ff8c00] to-[#ffaa00] px-5 font-bold text-white hover:from-[#ff9900] hover:to-[#ffb732]'>
              <Gavel className='mr-2 h-4 w-4' />
              Place Bid
            </SubmitBidButton>
          </div>
        </div>
      ) : null}
    </form>
  );
}
