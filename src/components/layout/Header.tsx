'use client';

import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const showBorder = pathname !== '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background ${
        showBorder ? 'border-b-1 border-outline' : 'border-b-0'
      }`}
    >
      <div className='grid md:grid md:grid-cols-[4rem_auto_20rem] items-center justify-stretch py-4 px-4 md:h-16 gap-x-2 gap-y-2'>
        <div>
          <Link href='/'>
            <img
              src='/bitbid-logo.png'
              alt='BitBid Logo'
              className='w-20 h-10'
            />
          </Link>
        </div>

        <div className='col-span-3 row-start-2 md:col-auto md:row-auto md:mx-2.5'>
          <div className='relative flex items-center'>
            <div className='absolute right-2 text-white'>
              <Search size={18} strokeWidth={2} />
            </div>
            <input
              type='text'
              placeholder='Search for anything'
              className='w-full h-8.5 bg-foreground text-s text-white placeholder-text-grey border-1 border-outline rounded-sm pl-4 focus:border-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0'
            />
          </div>
        </div>

        <div className='flex max-md:col-span-2 items-center max-md:justify-end md:justify-around'>
          <div>
            <Link
              href='/auth/signup'
              className='inline-flex h-8.5 w-20 items-center justify-center rounded-sm hover:bg-foreground'
            >
              Sign up
            </Link>
          </div>
          <div>
            <Link
              href='/auth/login'
              className='inline-flex h-8.5 w-20 items-center justify-center rounded-sm hover:bg-foreground'
            >
              Log in
            </Link>
          </div>
          <div>
            <Link
              href='/listings'
              className='inline-flex items-center justify-center bg-brand h-8.5 w-20 ml-2 rounded-sm hover:bg-brand-hover'
            >
              Sell
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
