import { randomBytes } from "node:crypto";

export type Link = { slug: string; target: string; visits: number; createdAt: string; expiresAt?: number };

const SLUG_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alikes
const SLUG_LENGTH = 7;

export function newSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let slug = "";
  for (const byte of bytes) slug += SLUG_ALPHABET[byte % SLUG_ALPHABET.length];
  return slug;
}

/** In-memory store. A real deployment would use Postgres; the API stays the same. */
export class LinkStore {
  private links = new Map<string, Link>();

  create(target: string, options: { slug?: string; ttlSeconds?: number } = {}): Link {
    let slug = options.slug ?? newSlug();
    if (!options.slug) while (this.links.has(slug)) slug = newSlug();
    const link: Link = { slug, target, visits: 0, createdAt: new Date().toISOString() };
    if (options.ttlSeconds) link.expiresAt = Date.now() + options.ttlSeconds;
    this.links.set(slug, link);
    return link;
  }

  get(slug: string): Link | undefined {
    return this.links.get(slug);
  }

  visit(slug: string): Link | undefined {
    const link = this.links.get(slug);
    if (!link) return undefined;
    if (link.expiresAt && link.expiresAt < Date.now()) {
      this.links.delete(slug);
      return undefined;
    }
    link.visits += 1;
    return link;
  }
}
