import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { consumeAuthToken, invalidateAuthTokens } from '@/lib/auth/tokens';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token')?.trim();

  if (!token) {
    return NextResponse.redirect(
      new URL('/auth/verify-email?status=invalid', request.url),
    );
  }

  const consumed = await consumeAuthToken(token, 'verify');
  if (!consumed) {
    return NextResponse.redirect(
      new URL('/auth/verify-email?status=invalid', request.url),
    );
  }

  await prisma.user.update({
    where: { email: consumed.email },
    data: { emailVerified: new Date() },
  });

  await invalidateAuthTokens(consumed.email, 'verify');

  return NextResponse.redirect(
    new URL('/auth/verify-email?status=success', request.url),
  );
}
