'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        toast.error('Could not process your request. Please try again.');
        return;
      }

      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='min-h-dvh px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <Card className='mx-auto flex w-full max-w-md flex-col gap-0 border-outline bg-card py-0 md:my-12'>
        <CardHeader className='px-5 pt-5 pb-2 md:px-6 md:pt-6'>
          <CardTitle className='text-xl tracking-tight md:text-2xl'>
            Reset password
          </CardTitle>
          <p className='mt-2 text-sm leading-snug text-grey'>
            Enter your account email and we will send reset instructions.
          </p>
        </CardHeader>
        <CardContent className='px-5 pb-5 md:px-6 md:pb-6'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4' noValidate>
            <div className='space-y-2'>
              <Label htmlFor='forgot-email'>Email</Label>
              <Input
                id='forgot-email'
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete='email'
                placeholder='you@example.com'
                required
              />
            </div>

            {sent ? (
              <p className='rounded-md border border-outline bg-background px-3 py-2 text-sm text-grey'>
                If an account exists, a reset email has been sent.
              </p>
            ) : null}

            <Button type='submit' size='lg' disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset email'}
            </Button>

            <Button asChild variant='link' className='h-auto p-0 text-grey'>
              <Link href='/auth/login'>Back to login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
