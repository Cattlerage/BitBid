import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateListingForm from '@/components/listing/CreateListingForm';

export default async function SellPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  return (
    <main className='min-h-screen pt-30 md:pt-20 px-4 text-white'>
      <div className='max-w-xl mx-auto bg-card border border-outline rounded-md p-4'>
        <h1 className='text-xl font-bold mb-4'>Create listing</h1>
        <CreateListingForm />
      </div>
    </main>
  );
}
