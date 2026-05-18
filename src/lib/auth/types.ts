import type { UserRole } from '@/generated/prisma/enums';

export type AuthUser = {
  id: string;
  email: string | null;
  role: UserRole;
  emailVerified: boolean;
};

export type PolicyDeniedCode =
  | 'UNAUTHENTICATED'
  | 'EMAIL_NOT_VERIFIED'
  | 'FORBIDDEN';

export type PolicyDecision =
  | { allowed: true }
  | { allowed: false; code: PolicyDeniedCode; message: string };
