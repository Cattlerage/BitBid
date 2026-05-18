'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ResendState = {
  type: 'idle' | 'success' | 'error';
  message?: string;
};

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendState, setResendState] = useState<ResendState>({ type: 'idle' });

  async function resendEmail() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.status === 401) {
        setResendState({
          type: 'error',
          message: 'Sign in to resend verification emails.',
        });
        return;
      }

      if (!res.ok) {
        setResendState({
          type: 'error',
          message: 'Could not resend verification email. Please try again.',
        });
        return;
      }

      setResendState({
        type: 'success',
        message: 'Verification email sent. Please check your inbox.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const banner =
    status === 'success'
      ? {
          message: 'Your email is verified. You can now create listings and place bids.',
          tone: 'text-green-300',
        }
      : status === 'invalid'
        ? {
            message: 'This verification link is invalid or expired.',
            tone: 'text-destructive',
          }
        : {
            message:
              'Check your inbox for a verification link. You must verify your email before listing, bidding, or uploads.',
            tone: 'text-grey',
          };

  return (
    <main className='min-h-dvh px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <Card className='mx-auto flex w-full max-w-md flex-col gap-0 border-outline bg-card py-0 md:my-12'>
        <CardHeader className='px-5 pt-5 pb-2 md:px-6 md:pt-6'>
          <CardTitle className='text-xl tracking-tight md:text-2xl'>
            Verify your email
          </CardTitle>
          <p className={`mt-2 text-sm leading-snug ${banner.tone}`}>{banner.message}</p>
        </CardHeader>
        <CardContent className='px-5 pb-5 md:px-6 md:pb-6'>
          <div className='flex flex-col gap-3'>
            <Button onClick={resendEmail} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Resend verification email'}
            </Button>

            {resendState.message ? (
              <p
                className={`rounded-md border border-outline bg-background px-3 py-2 text-sm ${
                  resendState.type === 'error' ? 'text-destructive' : 'text-grey'
                }`}
              >
                {resendState.message}
              </p>
            ) : null}

            <Button asChild variant='link' className='h-auto p-0 text-grey'>
              <Link href='/auth/login'>Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
