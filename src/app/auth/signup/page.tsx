'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { SignupFormSchema, type SignupFormInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function SignupPage() {
  const router = useRouter();

  const form = useForm<SignupFormInput>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  async function onSubmit(values: SignupFormInput) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        form.setError('email', {
          message: 'An account with this email already exists.',
        });
      } else {
        toast.error(data.error ?? 'Something went wrong. Please try again.');
      }
      return;
    }

    const signInResult = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!signInResult || signInResult.error) {
      toast.success('Account created. Please log in.');
      router.push('/auth/login');
      return;
    }

    router.push('/auth/verify-email');
    router.refresh();
  }

  return (
    <main className='min-h-dvh px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(11rem,env(safe-area-inset-top))] font-sans text-white md:min-h-screen md:pb-16 md:pt-16'>
      <Card className='mx-auto flex w-full max-w-md flex-col gap-0 border-outline bg-card py-0 md:my-12'>
        <CardHeader className='px-5 pt-5 pb-2 md:px-6 md:pt-6'>
          <CardTitle className='text-xl tracking-tight md:text-2xl'>
            Create your account
          </CardTitle>
          <p className='mt-2 text-sm leading-snug text-grey'>
            Already have an account?{' '}
            <Button
              asChild
              variant='link'
              className='text-brand hover:text-brand-hover h-auto p-0 underline-offset-2 hover:underline'
            >
              <Link href='/auth/login'>Log in</Link>
            </Button>
          </p>
        </CardHeader>
        <CardContent className='px-5 pb-5 md:px-6 md:pb-6'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4 md:gap-5'
              noValidate
            >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      autoComplete='name'
                      placeholder='Your name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      autoComplete='new-password'
                      placeholder='At least 8 characters'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      autoComplete='new-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='acceptedTerms'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-start gap-3'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='mt-0.5'
                      />
                    </FormControl>
                    <FormLabel className='text-sm leading-snug text-grey font-normal cursor-pointer'>
                      I agree to the <span className='text-white'>Terms</span>{' '}
                      and <span className='text-white'>Privacy Policy</span>.
                    </FormLabel>
                  </div>
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
              {form.formState.isSubmitting ? 'Creating account…' : 'Sign up'}
            </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
