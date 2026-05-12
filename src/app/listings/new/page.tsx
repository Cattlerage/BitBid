import { createListing } from '@/server/actions/createListing';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function SellPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }
  return (
    <main className='min-h-screen pt-30 md:pt-20 px-4 text-white'>
      <div className='max-w-xl mx-auto bg-card border border-outline rounded-md p-4'>
        <h1 className='text-xl font-bold mb-4'>Create listing</h1>

        <form action={createListing} className='flex flex-col gap-3'>
          <input
            name='title'
            placeholder='Title'
            className='bg-background border border-outline rounded px-3 py-2'
            required
          />
          <textarea
            name='description'
            placeholder='Description'
            className='bg-background border border-outline rounded px-3 py-2'
            required
          />
          <input
            name='startingBid'
            type='number'
            min={1}
            placeholder='Starting bid'
            className='bg-background border border-outline rounded px-3 py-2'
            required
          />

          <p className='text-xs text-grey'>
            All auctions end next day at 9:00 PM.
          </p>

          <Button type='submit'>Create</Button>
        </form>
      </div>
    </main>
  );
}
