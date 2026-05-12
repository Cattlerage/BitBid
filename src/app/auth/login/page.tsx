'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { LoginSchema, type LoginInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    const res = await signIn('credentials', { ...values, redirect: false });

    if (!res || res.error) {
      toast.error('Invalid email or password.');
      return;
    }

    router.push(params.get('callbackUrl') ?? '/listings');
    router.refresh();
  }

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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4 md:gap-5'
            noValidate
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      autoComplete='email'
                      placeholder='you@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <span
                      className='text-xs text-grey'
                      title='Not implemented yet'
                    >
                      Forgot password?
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      type='password'
                      autoComplete='current-password'
                      placeholder='Your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              size='lg'
              className='mt-2 h-11 w-full touch-manipulation md:h-10'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
