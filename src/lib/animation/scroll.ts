import gsap from "gsap";

type Teardown = () => void;

type LenisLike = {
  raf(t: number): void;
  destroy(): void;
  stop(): void;
  start(): void;
  scrollTo(target: string | number | HTMLElement, opts?: Record<string, unknown>): void;
};

let mounted = 0;
let teardown: Teardown | null = null;
/** the live Lenis instance, if smooth scrolling is on — for lockScroll */
let activeLenis: LenisLike | null = null;

/**
 * Starts smooth scrolling and same-page anchor routing. Lenis loads lazily
 * whenever motion is enabled. On touch screens it also drives the swipe itself
 * (syncTouch): the document never scrolls natively under a finger, so mobile
 * browsers keep their address and tool bars in place instead of collapsing
 * them. That keeps the viewport height fixed, so scroll-driven scenes (the
 * intro line) aren't re-measured mid-scroll.
 */
export function mountScroll(opts: { smooth: boolean }): Teardown {
  mounted += 1;
  if (teardown) return release;

  let lenis: LenisLike | null = null;
  let cancelled = false;

  const tick = () => lenis?.raf(performance.now());

  if (opts.smooth) {
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const instance = new Lenis({
        // Reduce travel per wheel/trackpad gesture and ease into the target.
        // Lenis ignores duration/easing when lerp is set.
        lerp: 0.055,
        wheelMultiplier: 0.55,
        // Touch: the page follows the finger 1:1, then glides on Lenis's own
        // inertia after release. Nested scrollers opt out with data-lenis-prevent.
        ...(touch
          ? { syncTouch: true, syncTouchLerp: 0.075, touchInertiaExponent: 1.7, touchMultiplier: 1 }
          : { touchMultiplier: 1.6 }),
      });
      lenis = instance as unknown as LenisLike;
      activeLenis = lenis;
      gsap.ticker.add(tick);
    });
  }

  /**
   * Same-page anchors have to go through Lenis. A native jump leaves Lenis
   * holding a stale internal target and it drags the page back, which strands
   * anything driven by scroll position part-way through its range.
   */
  const onAnchorClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const link = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as
      | HTMLAnchorElement
      | null;
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector<HTMLElement>(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: "smooth" });
  };
  document.addEventListener("click", onAnchorClick);

  teardown = () => {
    cancelled = true;
    gsap.ticker.remove(tick);
    document.removeEventListener("click", onAnchorClick);
    lenis?.destroy();
    lenis = null;
    activeLenis = null;
  };

  return release;
}

function release() {
  mounted -= 1;
  if (mounted <= 0 && teardown) {
    teardown();
    teardown = null;
    mounted = 0;
  }
}

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

/**
 * Freezes the page where it is — for a pinned scene that must play out
 * without the page moving underneath it. Stops Lenis (which also kills its
 * momentum), blocks wheel / touch / scroll keys, and holds the native scroll
 * position against inertia already in flight. allowProgrammatic lets a
 * coordinated scene move the document while user input is suspended. Returns the release.
 *
 * Deliberately NOT overflow: hidden — hiding the scrollbar would reflow the
 * page by its width and visibly jump the layout.
 */
export function lockScroll({ allowProgrammatic = false, allowWithin }: {
  allowProgrammatic?: boolean;
  /** Let a modal scroll while the page and Lenis remain frozen. */
  allowWithin?: HTMLElement;
} = {}): () => void {
  const y = window.scrollY;
  activeLenis?.stop();
  const block = (e: Event) => {
    if (allowWithin && e.target instanceof Node && allowWithin.contains(e.target)) return;
    if (e.cancelable) e.preventDefault();
  };
  const blockKeys = (e: KeyboardEvent) => {
    if (allowWithin && e.target instanceof Node && allowWithin.contains(e.target)) return;
    if (SCROLL_KEYS.has(e.key)) e.preventDefault();
  };
  const hold = () => {
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  };
  window.addEventListener("wheel", block, { passive: false, capture: true });
  window.addEventListener("touchmove", block, { passive: false, capture: true });
  window.addEventListener("keydown", blockKeys, { capture: true });
  if (!allowProgrammatic) window.addEventListener("scroll", hold, { passive: true });
  let released = false;
  return () => {
    if (released) return;
    released = true;
    window.removeEventListener("wheel", block, { capture: true });
    window.removeEventListener("touchmove", block, { capture: true });
    window.removeEventListener("keydown", blockKeys, { capture: true });
    window.removeEventListener("scroll", hold);
    activeLenis?.start();
  };
}

/** jumps the page to y at once, keeping Lenis in step */
export function jumpTo(y: number) {
  if (activeLenis) activeLenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/** scrolls the page to y over `duration` seconds, so scrubbed scenes play on the way */
export function glideTo(y: number, duration: number) {
  if (activeLenis) activeLenis.scrollTo(y, { duration, easing: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2), force: true });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
