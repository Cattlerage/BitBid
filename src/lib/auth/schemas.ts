import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Client-side: every field the signup form collects (+ frontend-only rules)
export const SignupFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.').max(100),
    email: z.string().trim().toLowerCase().email('Enter a valid email.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });
export type SignupFormInput = z.infer<typeof SignupFormSchema>;

// Server-side: only what the API actually persists
export const SignupServerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});
export type SignupServerInput = z.infer<typeof SignupServerSchema>;
