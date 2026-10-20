/**
 * Case studies open over the home page but each has its own URL. The home
 * experience renders at both "/" and "/work/<slug>", so anything that asks
 * "is this the home page?" should treat the two alike.
 */
const CASE_PATH = /^\/work\/([^/]+)\/?$/;

export const casePath = (slug: string) => `/work/${slug}`;

export const caseSlug = (pathname: string) => pathname.match(CASE_PATH)?.[1] ?? null;

export const isHomePath = (pathname: string) => pathname === "/" || CASE_PATH.test(pathname);
