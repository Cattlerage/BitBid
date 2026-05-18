import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateListingForm from '@/components/listing/CreateListingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SellPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  return (
    <main className='min-h-screen pt-30 md:pt-20 px-4 text-white'>
      <Card className='mx-auto max-w-2xl border-outline bg-card py-0 my-7 sm:my-8'>
        <CardHeader className='p-4 pb-0'>
          <CardTitle className='text-xl'>Create listing</CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          <CreateListingForm />
        </CardContent>
      </Card>
    </main>
  );
}
