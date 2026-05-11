'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type FieldErrors = Partial<{
  email: string;
  password: string;
}>;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!password) {
      next.password = 'Password is required.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(false);

    if (!validate()) return;

    setSubmitted(true);
    setErrors({});
  }

  const inputClass =
    'w-full min-h-11 h-11 rounded-sm border border-outline bg-foreground px-3 text-base text-white placeholder:text-grey md:h-10 md:min-h-10 md:text-sm focus:border-white focus:outline-none focus:ring-0';

  return (
    <main className=' px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
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

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4 md:gap-5'
          noValidate
        >
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='login-email' className='text-sm text-grey'>
              Email
            </label>
            <input
              id='login-email'
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder='you@example.com'
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email ? (
              <p id='login-email-error' className='text-xs text-red-400'>
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className='flex flex-col gap-1.5'>
            <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2'>
              <label htmlFor='login-password' className='text-sm text-grey'>
                Password
              </label>
              <span
                className='text-xs text-grey sm:shrink-0'
                title='Not implemented yet'
              >
                Forgot password?
              </span>
            </div>
            <input
              id='login-password'
              name='password'
              type='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder='Your password'
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
            />
            {errors.password ? (
              <p id='login-password-error' className='text-xs text-red-400'>
                {errors.password}
              </p>
            ) : null}
          </div>

          <label className='flex cursor-pointer items-center gap-3 text-sm text-grey'>
            <input
              type='checkbox'
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className='size-5 shrink-0 rounded-sm border border-outline bg-foreground accent-brand md:size-4'
            />
            Remember me
          </label>

          <button
            type='submit'
            className='mt-2 min-h-11 w-full touch-manipulation rounded-sm bg-brand py-2.5 text-base font-medium text-background hover:bg-brand-hover md:h-10 md:min-h-10 md:py-0 md:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
          >
            Log in
          </button>

          {submitted ? (
            <p className='rounded-sm border border-outline bg-foreground px-3 py-2 text-sm text-grey'>
              Form looks valid — hook up auth or an API here; nothing was saved.
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
