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

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    const res = await signIn('credentials', { ...values, redirect: false });

    if (!res || res.error) {
      toast.error('Invalid email or password.');
      return;
    }

    router.push(params.get('callbackUrl') ?? '/listings/new');
    router.refresh();
  }

  return (
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
                <Link
                  href='/auth/forgot-password'
                  className='text-xs text-grey hover:text-white underline-offset-2 hover:underline'
                >
                  Forgot password?
                </Link>
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
  );
}
