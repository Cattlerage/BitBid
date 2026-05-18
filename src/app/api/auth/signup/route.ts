import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SignupServerSchema } from '@/lib/auth/schemas';
import { issueAuthToken } from '@/lib/auth/tokens';
import { sendEmail } from '@/lib/email/resend';
import { VerifyEmailTemplate } from '@/emails/verify-email';
import { getAppUrl } from '@/lib/app-url';

export async function POST(request: Request) {
  let json;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = SignupServerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash, role: 'USER' },
    select: { id: true },
  });

  const verifyToken = await issueAuthToken(email, 'verify');
  const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`;

  await sendEmail({
    to: email,
    subject: 'Verify your BitBid email',
    react: VerifyEmailTemplate({ verifyUrl }),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
