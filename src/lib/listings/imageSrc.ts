export function listingImageSrcFromKey(key: string): string {
  const encoded = key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  return `/api/uploads/listings-image/object/${encoded}`;
}
