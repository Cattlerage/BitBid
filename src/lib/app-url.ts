const DEFAULT_APP_URL = 'http://localhost:3000';

export function getAppUrl() {
  const appUrl =
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL;

  return appUrl.replace(/\/+$/, '');
}
