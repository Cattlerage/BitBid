import { auth } from '@/auth';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const session = await auth();
  return (
    <HeaderClient
      user={
        session?.user as {
          id: string;
          name: string | null;
          email: string | null;
          image: string | null;
        } | null
      }
    />
  );
}
