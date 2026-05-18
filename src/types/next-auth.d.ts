import type { DefaultSession } from 'next-auth';

type AppUserRole = 'USER' | 'ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: AppUserRole;
      isEmailVerified: boolean;
    } & DefaultSession['user'];
  }
  interface User {
    id: string;
    role: AppUserRole;
    emailVerified: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: AppUserRole;
    emailVerified?: string | null;
  }
}
