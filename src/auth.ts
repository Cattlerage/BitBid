import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // When using custom email/password, Auth.js forces you to use JWTs
    // instead of database sessions for security reasons.
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      const { pathname } = request.nextUrl;

      const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/signup',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
      ];
      if (publicRoutes.includes(pathname)) return true;

      if (pathname.startsWith('/listings/') && pathname !== '/listings/new') {
        return true;
      }

      return !!auth?.user;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified?.toISOString() ?? null;
      }

      if (token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, emailVerified: true },
        });

        if (freshUser) {
          token.role = freshUser.role;
          token.emailVerified = freshUser.emailVerified?.toISOString() ?? null;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'USER' | 'ADMIN' | undefined) ?? 'USER';
        session.user.isEmailVerified = Boolean(token.emailVerified);
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Validate input
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Fetch the user from the DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // 3. Bail if no user OR no password hash (OAuth-only account)
        if (!user || !user.passwordHash) {
          return null;
        }

        // 4. Compare the submitted password to the stored hash
        const passwordMatches = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        // 5. Return ONLY safe fields — this goes into the JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
});
