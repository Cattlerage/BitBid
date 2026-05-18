import { type ZodError } from 'zod';

export function firstZodIssueMessage(
  error: ZodError,
  fallback = 'Invalid input',
) {
  return error.issues[0]?.message ?? fallback;
}
