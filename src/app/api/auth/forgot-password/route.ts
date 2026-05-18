import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ForgotPasswordSchema } from '@/lib/auth/schemas';
import { issueAuthToken } from '@/lib/auth/tokens';
import { sendEmail } from '@/lib/email/resend';
import { ResetPasswordTemplate } from '@/emails/reset-password';
import { getAppUrl } from '@/lib/app-url';

const GENERIC_RESPONSE = {
  ok: true,
  message: 'If an account exists, a reset email has been sent.',
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = ForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { email: true, passwordHash: true },
  });

  if (user?.passwordHash) {
    const resetToken = await issueAuthToken(user.email, 'reset');
    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your BitBid password',
      react: ResetPasswordTemplate({ resetUrl }),
    });
  }

  return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
}
