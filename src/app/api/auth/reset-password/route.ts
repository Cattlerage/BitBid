import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { ResetPasswordSchema } from '@/lib/auth/schemas';
import { consumeAuthToken, invalidateAuthTokens } from '@/lib/auth/tokens';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = ResetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const consumed = await consumeAuthToken(parsed.data.token, 'reset');
  if (!consumed) {
    return NextResponse.json(
      { error: 'Invalid or expired reset token.' },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { email: consumed.email },
    data: { passwordHash },
  });

  await invalidateAuthTokens(consumed.email, 'reset');

  return NextResponse.json({ ok: true }, { status: 200 });
}
