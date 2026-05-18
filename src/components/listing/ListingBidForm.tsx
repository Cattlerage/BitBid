'use client';

import { type FormEvent, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Clock, Gavel } from 'lucide-react';

import { placeBid, type PlaceBidState } from '@/server/actions/placeBid';
import { placeBidFormSchema } from '@/lib/bids/schemas';
import { firstZodIssueMessage } from '@/lib/zod/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LiveCountdown from './LiveCountdown';

function formatGroupedNumber(value: string | number) {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function sanitizeBidAmount(value: string) {
  return value.replace(/\D/g, '');
}

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
  isOwner: boolean;
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
  isOwner,
  isLive,
  minNextBid,
  minNextBidLabel,
  currentBidLabel,
  endsAtLabel,
  bidCount,
}: Props) {
  const [state, formAction] = useActionState(placeBid, null as PlaceBidState);
  const [displayAmount, setDisplayAmount] = useState(
    formatGroupedNumber(minNextBid),
  );
  const [rawAmount, setRawAmount] = useState(String(minNextBid));
  const [clientError, setClientError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = placeBidFormSchema(minNextBid).safeParse({
      listingId: formData.get('listingId'),
      amount: formData.get('amount'),
    });

    if (!parsed.success) {
      event.preventDefault();
      setClientError(firstZodIssueMessage(parsed.error, 'Enter a valid bid amount.'));
      return;
    }

    setClientError(null);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className='contents'>
      <Input type='hidden' name='listingId' value={listingId} />

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
                <LiveCountdown
                  endAt={endsAtLabel}
                  mode='tokens'
                  endedLabel='Ended'
                  className='font-bold text-destructive'
                />
              </Badge>
              <p className='text-grey text-xs'>Ends {endsAtLabel}</p>
            </div>
          </div>

          {!isOwner ? (
            <>
              <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:gap-3'>
                <div className='relative flex-1'>
                  <Input
                    type='text'
                    inputMode='numeric'
                    autoComplete='off'
                    value={displayAmount}
                    onChange={(e) => {
                      const normalized = sanitizeBidAmount(e.target.value);
                      setRawAmount(normalized);
                      setDisplayAmount(formatGroupedNumber(normalized));
                      if (clientError) {
                        setClientError(null);
                      }
                    }}
                    placeholder='xxx.xxx.xxx'
                    required
                    disabled={!isLive}
                    className='h-12 border-outline bg-background pl-3 text-base font-semibold'
                  />
                  <Input type='hidden' name='amount' value={rawAmount} />
                </div>
                <SubmitBidButton
                  disabled={!isLive}
                  className='h-12 w-full bg-linear-to-r from-[#ff8c00] to-[#ffaa00] px-6 font-bold text-background hover:from-[#ff9900] hover:to-[#ffb732] sm:w-auto sm:px-8'
                >
                  <Gavel className='mr-2 h-5 w-5 text-background' />
                  Place Bid
                </SubmitBidButton>
              </div>

              <p className='text-grey text-center text-xs'>
                Enter {minNextBidLabel} or more
              </p>
            </>
          ) : null}
          {clientError || state?.error ? (
            <p className='text-destructive mt-3 text-sm' role='alert'>
              {clientError ?? state?.error}{' '}
              {(clientError ?? state?.error) === 'Sign in to place a bid.' ? (
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
    </form>
  );
}
