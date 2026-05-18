import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { issueAuthToken } from '@/lib/auth/tokens';
import { sendEmail } from '@/lib/email/resend';
import { VerifyEmailTemplate } from '@/emails/verify-email';
import { getAppUrl } from '@/lib/app-url';
import { ResendVerificationSchema } from '@/lib/auth/schemas';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = ResendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const verifyToken = await issueAuthToken(user.email, 'verify');
  const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your BitBid email',
    react: VerifyEmailTemplate({ verifyUrl }),
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
