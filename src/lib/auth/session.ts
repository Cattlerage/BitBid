import { auth } from '@/auth';
import type { AuthUser } from '@/lib/auth/types';

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: session.user.role ?? 'USER',
    emailVerified: Boolean(session.user.isEmailVerified),
  };
}
