/**
 * Environment probes. Read once at mount — never during render, so the
 * server and the first client pass always agree.
 */

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Tablets and phones: no Services → Featured Work dive (too expensive there).
 * Mirrored in ServicesSection.css; keep the two in step.
 */
export const COMPACT_QUERY = "(max-width: 1024px), (hover: none) and (pointer: coarse)";

export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Resolves when webfonts are ready, or after `timeout` — whichever is first. */
export function fontsReady(timeout = 1200): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return Promise.resolve();
  }
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((r) => setTimeout(r, timeout)),
  ]);
}

/**
 * Resolves once the site loader has finished revealing the page (it sets
 * html[data-site-loading] while it is up), or at once when there is none.
 * For intros that start themselves outside GSAP's (held) timeline.
 */
export function introsReady(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const root = document.documentElement;
  if (!root.hasAttribute("data-site-loading")) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (root.hasAttribute("data-site-loading")) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-site-loading"] });
  });
}
