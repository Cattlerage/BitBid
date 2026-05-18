import type { AuthUser, PolicyDecision } from '@/lib/auth/types';

function allow(): PolicyDecision {
  return { allowed: true };
}

function unauthenticated(message: string): PolicyDecision {
  return { allowed: false, code: 'UNAUTHENTICATED', message };
}

function emailNotVerified(message = 'Verify your email to continue.'): PolicyDecision {
  return { allowed: false, code: 'EMAIL_NOT_VERIFIED', message };
}

function forbidden(message: string): PolicyDecision {
  return { allowed: false, code: 'FORBIDDEN', message };
}

function requireVerifiedUser(
  user: AuthUser | null,
  signinMessage: string,
): PolicyDecision {
  if (!user) {
    return unauthenticated(signinMessage);
  }

  if (!user.emailVerified) {
    return emailNotVerified();
  }

  return allow();
}

export function canCreateListing(user: AuthUser | null): PolicyDecision {
  return requireVerifiedUser(user, 'Sign in to create a listing.');
}

export function canUploadListingImages(user: AuthUser | null): PolicyDecision {
  return requireVerifiedUser(user, 'Sign in to upload listing images.');
}

export function canPlaceBid(
  user: AuthUser | null,
  listing?: { sellerId: string },
): PolicyDecision {
  const verified = requireVerifiedUser(user, 'Sign in to place a bid.');
  if (!verified.allowed) {
    return verified;
  }
  if (!user) {
    return unauthenticated('Sign in to place a bid.');
  }

  if (listing && listing.sellerId === user.id) {
    return forbidden("You can't bid on your own listing.");
  }

  return allow();
}

export function canDeleteListing(
  user: AuthUser | null,
  listing?: { sellerId: string },
): PolicyDecision {
  const verified = requireVerifiedUser(user, 'Sign in to delete this listing.');
  if (!verified.allowed) {
    return verified;
  }
  if (!user) {
    return unauthenticated('Sign in to delete this listing.');
  }

  if (!listing || listing.sellerId === user.id || user.role === 'ADMIN') {
    // ADMIN can delete any listing for moderation workflows.
    return allow();
  }

  return forbidden('You can only delete your own listings.');
}

export function canAccessAdmin(user: AuthUser | null): PolicyDecision {
  if (!user) {
    return unauthenticated('Sign in to continue.');
  }

  if (user.role !== 'ADMIN') {
    return forbidden('Admin access required.');
  }

  return allow();
}
