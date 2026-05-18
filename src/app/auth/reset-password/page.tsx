'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasToken = useMemo(() => token.length > 0, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasToken || isSubmitting) return;

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? 'Could not reset password.');
        return;
      }

      toast.success('Password updated. You can now log in.');
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='min-h-dvh px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <Card className='mx-auto flex w-full max-w-md flex-col gap-0 border-outline bg-card py-0 md:my-12'>
        <CardHeader className='px-5 pt-5 pb-2 md:px-6 md:pt-6'>
          <CardTitle className='text-xl tracking-tight md:text-2xl'>
            Set a new password
          </CardTitle>
          <p className='mt-2 text-sm leading-snug text-grey'>
            Choose a strong password with at least 8 characters.
          </p>
        </CardHeader>
        <CardContent className='px-5 pb-5 md:px-6 md:pb-6'>
          {!hasToken ? (
            <div className='space-y-3 text-sm text-grey'>
              <p>This reset link is invalid or missing.</p>
              <Button asChild variant='link' className='h-auto p-0'>
                <Link href='/auth/forgot-password'>Request a new link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-4' noValidate>
              <div className='space-y-2'>
                <Label htmlFor='reset-password'>New password</Label>
                <Input
                  id='reset-password'
                  type='password'
                  autoComplete='new-password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='reset-confirm-password'>Confirm password</Label>
                <Input
                  id='reset-confirm-password'
                  type='password'
                  autoComplete='new-password'
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {submitError ? (
                <p className='rounded-md border border-outline bg-background px-3 py-2 text-sm text-destructive'>
                  {submitError}
                </p>
              ) : null}

              <Button type='submit' size='lg' disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
