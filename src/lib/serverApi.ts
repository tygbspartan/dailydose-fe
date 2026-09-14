import { headers } from "next/headers";

/**
 * Absolute API base URL for use in Server Components (e.g. generateMetadata),
 * where a relative "/api" can't be fetched.
 *  - Dev: NEXT_PUBLIC_API_URL is absolute (http://localhost:5000/api) → use it.
 *  - Merged prod: NEXT_PUBLIC_API_URL is "/api" → build an absolute URL from the
 *    incoming request host (same origin serves the API).
 */
export async function serverApiBase(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_API_URL || "/api";
  if (/^https?:\/\//.test(env)) return env;

  const h = await headers();
  const host = h.get("host") ?? `localhost:${process.env.PORT ?? 3000}`;
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}${env}`;
}
