const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "localhost";
const PROTO = process.env.NEXT_PUBLIC_PROTOCOL ?? "http";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT ?? "8000"; // "" in prod behind a same-origin proxy
const APP_PORT = process.env.NEXT_PUBLIC_APP_PORT ?? "3000";

export function getTenantSlug(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (!host.endsWith(`.${BASE}`)) return null;
  const slug = host.slice(0, -(BASE.length + 1));
  return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

export function getApiOrigin(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : BASE;
  return `${PROTO}://${host}${API_PORT ? `:${API_PORT}` : ""}`;
}

export const graphqlUrl = () => `${getApiOrigin()}/graphql/`;

export const tenantAppUrl = (slug: string, path = "/") =>
  `${PROTO}://${slug}.${BASE}${APP_PORT ? `:${APP_PORT}` : ""}${path}`;