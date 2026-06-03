/**
 * Resolve a stored upload path ("/uploads/...") to a URL the browser can fetch
 * through the API proxy. Pass-through for absolute URLs and data URIs.
 */
export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
}

/**
 * Resolve the displayable src/href for a stored file that may carry either a
 * persisted `url` (disk storage) or an inline `data` base64 URI (unsaved
 * preview from the file picker).
 */
export function fileSrc(item?: { url?: string | null; data?: string | null } | null): string {
  if (!item) return "";
  if (item.url) return mediaUrl(item.url);
  return item.data ?? "";
}
