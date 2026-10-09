const MAX_URL_LENGTH = 2048;

/** Accepts only absolute http(s) URLs, so a short link can't point at javascript: or file: URLs. */
export function parseTargetUrl(input: unknown): string | null {
  if (typeof input !== "string" || input.length > MAX_URL_LENGTH) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
