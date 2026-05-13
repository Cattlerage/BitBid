import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className='px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <div className='mx-auto flex w-full max-w-md flex-col gap-6 py-6 md:gap-8 md:py-12'>
        <div>
          <h1 className='text-xl font-bold tracking-tight md:text-2xl'>
            Log in
          </h1>
          <p className='mt-2 text-sm leading-snug text-grey'>
            New here?{' '}
            <Link
              href='/auth/signup'
              className='text-brand hover:text-brand-hover underline-offset-2 hover:underline'
            >
              Create an account
            </Link>
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
