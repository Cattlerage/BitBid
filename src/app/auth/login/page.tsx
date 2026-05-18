import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className='px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <Card className='mx-auto flex w-full max-w-md flex-col gap-0 border-outline bg-card py-0 md:my-12'>
        <CardHeader className='px-5 pt-5 pb-2 md:px-6 md:pt-6'>
          <CardTitle className='text-xl tracking-tight md:text-2xl'>Log in</CardTitle>
          <p className='mt-2 text-sm leading-snug text-grey'>
            New here?{' '}
            <Button
              asChild
              variant='link'
              className='text-brand hover:text-brand-hover h-auto p-0 underline-offset-2 hover:underline'
            >
              <Link href='/auth/signup'>Create an account</Link>
            </Button>
          </p>
        </CardHeader>
        <CardContent className='px-5 pb-5 md:px-6 md:pb-6'>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
