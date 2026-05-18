import { Resend } from 'resend';
import type { ReactElement } from 'react';

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({ to, subject, react }: SendEmailInput) {
  if (!resend || !emailFrom) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Email not sent: missing RESEND_API_KEY or EMAIL_FROM');
      return { skipped: true as const };
    }

    throw new Error('Email configuration is missing.');
  }

  const { error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    react,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email.');
  }

  return { skipped: false as const };
}
