'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type FieldErrors = Partial<{
  email: string;
  password: string;
  confirmPassword: string;
}>;

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    } else if (password.length < 8) {
      next.password = 'Use at least 8 characters.';
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptedTerms) {
      next.email = next.email ?? 'You must accept the terms to continue.';
      if (!next.email.includes('terms')) {
        next.email = 'You must accept the terms to continue.';
      }
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
    <main className='min-h-dvh px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <div className='mx-auto flex w-full max-w-md flex-col gap-6 py-6 md:gap-8 md:py-12'>
        <div>
          <h1 className='text-xl font-bold tracking-tight md:text-2xl'>
            Create your account
          </h1>
          <p className='mt-2 text-sm leading-snug text-grey'>
            Already have an account?{' '}
            <Link
              href='/auth/login'
              className='text-brand hover:text-brand-hover underline-offset-2 hover:underline'
            >
              Log in
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4 md:gap-5'
          noValidate
        >
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='email' className='text-sm text-grey'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder='you@example.com'
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email ? (
              <p id='email-error' className='text-xs text-red-400'>
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='password' className='text-sm text-grey'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='new-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder='At least 8 characters'
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password ? (
              <p id='password-error' className='text-xs text-red-400'>
                {errors.password}
              </p>
            ) : null}
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='confirmPassword' className='text-sm text-grey'>
              Confirm password
            </label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              autoComplete='new-password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? 'confirm-password-error' : undefined
              }
            />
            {errors.confirmPassword ? (
              <p id='confirm-password-error' className='text-xs text-red-400'>
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>

          <label className='flex cursor-pointer items-start gap-3 text-sm leading-snug text-grey'>
            <input
              type='checkbox'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className='mt-0.5 size-5 shrink-0 rounded-sm border border-outline bg-foreground accent-brand md:size-4'
            />
            <span>
              I agree to the <span className='text-white'>Terms</span> and{' '}
              <span className='text-white'>Privacy Policy</span>.
            </span>
          </label>

          <button
            type='submit'
            className='mt-2 min-h-11 w-full touch-manipulation rounded-sm bg-brand py-2.5 text-base font-medium text-background hover:bg-brand-hover md:h-10 md:min-h-10 md:py-0 md:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
          >
            Sign up
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
