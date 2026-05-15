'use client';

import type { FormEvent } from 'react';
import {
  Search,
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { logoutAction } from '@/server/actions/logout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
};

export default function HeaderClient({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const showBorder = pathname !== '/';

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = String(formData.get('q') ?? '');
    const trimmed = raw.trim();

    const params = pathname.startsWith('/listings')
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();

    if (trimmed) params.set('q', trimmed);
    else params.delete('q');

    params.delete('page');

    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-45 bg-background ${
        showBorder ? 'border-b border-outline' : 'border-b-0'
      }`}
    >
      <div className='grid md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] items-center justify-stretch py-4 px-4 md:h-16 gap-x-2 gap-y-2'>
        <div>
          <Link href='/'>
            <Image
              src='/bitbid-logo.png'
              alt='BitBid Logo'
              width={80}
              height={40}
              className='w-20 h-10 object-contain'
              priority
            />
          </Link>
        </div>

        <div className='col-span-3 row-start-2 md:col-auto md:row-auto md:mx-2.5'>
          <form
            onSubmit={handleSearchSubmit}
            className='relative flex items-center'
          >
            <button
              type='submit'
              aria-label='Search listings'
              className='absolute right-2 text-white'
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <input
              name='q'
              type='text'
              defaultValue={searchParams.get('q') ?? ''}
              placeholder='Search for anything'
              className='w-full h-8.5 bg-card text-s text-white placeholder-text-grey border border-outline rounded-sm pl-4 pr-9 focus:border-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0'
            />
          </form>
        </div>

        <div className='flex max-md:col-span-2 shrink-0 items-center max-md:justify-end md:justify-evenly gap-5 sm:gap-3'>
          {user ? (
            <>
              <Button asChild size='sm' className='w-20 shrink-0'>
                <Link href='/listings/new'>Sell</Link>
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='shrink-0 rounded-full focus-visible:ring-0'
                  >
                    <Avatar size='lg'>
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? user.email}
                      />
                      <AvatarFallback>
                        {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                      <AvatarBadge className='bg-green-400' />
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheckIcon />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCardIcon />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BellIcon />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <form action={logoutAction}>
                    <DropdownMenuItem asChild>
                      <button
                        type='submit'
                        className='w-full flex items-center gap-2 cursor-pointer'
                      >
                        <LogOutIcon />
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className='flex shrink-0 items-center gap-2 sm:gap-3'>
                <Button
                  asChild
                  variant='ghost'
                  size='sm'
                  className='h-8 shrink-0 whitespace-nowrap px-3 sm:min-w-20'
                >
                  <Link href='/auth/signup'>Sign up</Link>
                </Button>
                <Button
                  asChild
                  variant='ghost'
                  size='sm'
                  className='h-8 shrink-0 whitespace-nowrap px-3 sm:min-w-20'
                >
                  <Link href='/auth/login'>Log in</Link>
                </Button>
              </div>
              <Button asChild size='sm' className='w-20 shrink-0'>
                <Link href='/listings/new'>Sell</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
