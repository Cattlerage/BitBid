import crypto from 'node:crypto';
import prisma from '@/lib/prisma';

type TokenPurpose = 'verify' | 'reset';

const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  verify: 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

function getIdentifier(purpose: TokenPurpose, email: string) {
  return `${purpose}:${email.trim().toLowerCase()}`;
}

function hashToken(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function createRawToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export async function issueAuthToken(email: string, purpose: TokenPurpose) {
  const identifier = getIdentifier(purpose, email);
  const rawToken = createRawToken();
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + TOKEN_TTL_MS[purpose]);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return rawToken;
}

export async function consumeAuthToken(rawToken: string, purpose: TokenPurpose) {
  const token = hashToken(rawToken);
  const prefix = `${purpose}:`;

  const record = await prisma.verificationToken.findFirst({
    where: {
      token,
      identifier: { startsWith: prefix },
    },
  });

  if (!record) {
    return null;
  }

  if (record.expires <= new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: record.identifier,
          token: record.token,
        },
      },
    });
    return null;
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  });

  return {
    email: record.identifier.slice(prefix.length),
  };
}

export async function invalidateAuthTokens(email: string, purpose: TokenPurpose) {
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: getIdentifier(purpose, email),
    },
  });
}
