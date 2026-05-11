import { createListing } from '@/server/actions/createListing';

export default function SellPage() {
  return (
    <main className='min-h-screen pt-30 md:pt-20 px-4 text-white'>
      <div className='max-w-xl mx-auto bg-foreground border border-outline rounded-md p-4'>
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

          <button
            type='submit'
            className='bg-brand hover:bg-brand-hover rounded px-3 py-2 font-semibold'
          >
            Create
          </button>
        </form>
      </div>
    </main>
  );
}
