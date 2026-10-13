"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./RouteTransition.module.css";

/**
 * Site loader and page transition, after Lusion's: "Bytes." sits on black
 * while the page loads, then the word becomes a window onto the page and the
 * camera flies into its full stop until the page fills the screen. Leaving a
 * page plays the same flight in reverse, back out to the word, and the next
 * page (a full load) picks up from that exact frame.
 */

/** Lusion's pace: about half a second each way, with a short beat between. */
const REVEAL_MS = 1100;
const EXIT_MS = 900;
/**
 * Lusion-style pacing. Opening lingers on the word and then rushes through
 * the dot; closing is its exact time-reversal, rushing out and settling slowly
 * onto the word. (Zoom is already log-scaled in draw(), so this curve sets
 * how the dive itself feels over time.)
 */
const OPEN_EASE = (t: number) => t ** 2.2;
const CLOSE_EASE = (t: number) => 1 - (1 - t) ** 2.2;
/** The word always holds on screen for at least this beat. */
const HOLD_MS = 350;
/** The counter only appears when loading is actually taking this long. */
const COUNTER_AFTER_MS = 500;
/** Set while leaving a page, so the next one skips the full count. */
const TRANSITION_KEY = "bp:page-transition";
/** Once shown, the counter's run from 000 toward 100. */
const COUNT_MS = 900;
/** Give up waiting on slow assets; the page is usable well before this. */
const MAX_LOAD_MS = 6000;
const TILT = 9 * (Math.PI / 180);
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Hold every intro from the first client tick (GSAP timelines, and CSS
 * animations via html[data-site-loading] in globals.css) so pages build their
 * entrances as usual but only play them once the reveal has finished.
 */
function holdIntros() {
  gsap.globalTimeline.pause();
  document.documentElement.setAttribute("data-site-loading", "");
}
function playIntros() {
  document.documentElement.removeAttribute("data-site-loading");
  gsap.globalTimeline.resume();
}
/**
 * html[data-site-transition] is present while the overlay is up (loading,
 * revealing, or flying out to another page), so pointer effects such as the
 * home page's trail can stand down until the page is actually in view.
 */
function markTransition(active: boolean) {
  document.documentElement.toggleAttribute("data-site-transition", active);
}

if (typeof window !== "undefined" && !reducedMotion()) {
  markTransition(true);
  holdIntros();
  // Should the loader never mount, never leave the site frozen.
  window.setTimeout(() => {
    if (document.querySelector('[data-state="open"]') || !document.querySelector("[data-live]")) {
      markTransition(false);
      playIntros();
    }
  }, MAX_LOAD_MS + 4000);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

type Geometry = {
  font: string;
  spacing: string;
  x: number;
  baseline: number;
  /** The full stop, drawn as a true circle (the camera's way in). */
  dot: { x: number; y: number; r: number };
  /** The dot's centre: the point the camera flies into. */
  target: { x: number; y: number };
  /** Zoom at which the dot alone covers the whole viewport. */
  maxZoom: number;
};

export default function RouteTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const baselineRef = useRef<HTMLElement>(null);
  const dotRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    const word = wordRef.current;
    const probe = baselineRef.current;
    const dot = dotRef.current;
    const counter = counterRef.current;
    const ctx = canvas?.getContext("2d");
    const reduced = reducedMotion();
    overlay?.setAttribute("data-live", "");
    if (!overlay || !canvas || !word || !probe || !dot || !counter || !ctx || reduced) {
      playIntros();
      if (overlay) overlay.dataset.state = "open";
      markTransition(false);
      return;
    }

    holdIntros();
    const hasLetterSpacing = "letterSpacing" in ctx;
    // Without canvas tracking, track the HTML word the same (none) so the
    // hand-off between the two stays pixel-exact.
    if (!hasLetterSpacing) word.style.letterSpacing = "0";

    let disposed = false;
    let frame = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let geometry: Geometry | null = null;
    /** 0 = the word on black, 1 = fully inside the dot (page visible). */
    let depth = 0;
    let navigating = false;
    let unlockInput: (() => void) | null = null;
    /** Whether the counter came in during this load (it usually doesn't). */
    let counterShown = false;

    const setState = (state: "cover" | "flight" | "open") => {
      overlay.dataset.state = state;
      markTransition(state !== "open");
    };
    const setCounter = (value: number) => { counter.textContent = String(Math.round(value * 100)).padStart(3, "0"); };

    /** Reads the HTML word's exact position so the canvas draws it in place. */
    function measure(): Geometry {
      const style = getComputedStyle(word!);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const spacing = hasLetterSpacing ? style.letterSpacing : "0px";
      const x = word!.getBoundingClientRect().left;
      const baseline = probe!.getBoundingClientRect().bottom;
      const box = dot!.getBoundingClientRect();
      const radius = Math.max(1, box.width / 2);
      return {
        font,
        spacing,
        x,
        baseline,
        dot: { x: box.left + radius, y: box.top + box.height / 2, r: radius },
        target: { x: box.left + radius, y: box.top + box.height / 2 },
        // The camera ends centred on the dot, so its disc has to reach the corners.
        maxZoom: (Math.hypot(width, height) / 2 / radius) * 1.08,
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      if (overlay!.dataset.state !== "open") geometry = measure();
      if (overlay!.dataset.state === "flight") draw(depth);
    }

    /** One frame of the flight: black, with the word cut out as a window. */
    function draw(amount: number) {
      if (!geometry) return;
      const { font, spacing, x, baseline, dot: d, target, maxZoom } = geometry;
      // Log-space zoom: a slow push at first, then a rush into the dot.
      const zoom = maxZoom ** (amount ** 2.3);
      const tilt = TILT * smooth(amount);
      // The dot drifts to the middle of the screen as the camera closes in.
      const drift = smooth(clamp01(amount / 0.8));
      const sx = target.x + (width / 2 - target.x) * drift;
      const sy = target.y + (height / 2 - target.y) * drift;
      // White letters first, then the page shows through them.
      // The cutout itself fills with white, not the page: none while the
      // window still covers the screen, then gradually solid as it shrinks
      // back into the word (and, opening, clearing as it grows).
      const wash = 1 - smooth(clamp01((amount - 0.2) / 0.6));

      const word = () => {
        ctx!.fillText("Bytes", x, baseline);
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fill();
      };

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = "#000";
      ctx!.fillRect(0, 0, width, height);

      ctx!.translate(sx, sy);
      ctx!.rotate(tilt);
      ctx!.scale(zoom, zoom);
      ctx!.translate(-target.x, -target.y);
      ctx!.font = font;
      if (hasLetterSpacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = spacing;
      ctx!.textBaseline = "alphabetic";
      ctx!.globalCompositeOperation = "destination-out";
      word();
      if (wash > 0) {
        ctx!.globalCompositeOperation = "source-over";
        ctx!.globalAlpha = wash;
        ctx!.fillStyle = getComputedStyle(overlay!).color;
        word();
      }
    }

    function fly(from: number, to: number, duration: number, ease: (t: number) => number, onFrame: (t: number) => void, done: () => void) {
      cancelAnimationFrame(frame);
      const start = performance.now();
      const tick = (now: number) => {
        if (disposed) return;
        const t = clamp01((now - start) / duration);
        depth = from + (to - from) * ease(t);
        draw(depth);
        onFrame(t);
        if (t < 1) frame = requestAnimationFrame(tick);
        else done();
      };
      frame = requestAnimationFrame(tick);
    }

    /** Blocks user scrolling (not programmatic) while the loader is up. */
    function lockInput() {
      const block = (e: Event) => {
        if (e.cancelable) e.preventDefault();
        e.stopImmediatePropagation();
      };
      const blockKeys = (e: KeyboardEvent) => { if (SCROLL_KEYS.has(e.key)) block(e); };
      window.addEventListener("wheel", block, { passive: false, capture: true });
      window.addEventListener("touchmove", block, { passive: false, capture: true });
      window.addEventListener("keydown", blockKeys, { capture: true });
      return () => {
        window.removeEventListener("wheel", block, { capture: true });
        window.removeEventListener("touchmove", block, { capture: true });
        window.removeEventListener("keydown", blockKeys, { capture: true });
      };
    }

    function reveal() {
      setState("cover");
      geometry = measure();
      setState("flight");
      draw(0);
      fly(0, 1, REVEAL_MS, OPEN_EASE, (t) => {
        if (counterShown) counter!.style.opacity = String(1 - clamp01(t / 0.2));
      }, () => {
        setState("open");
        counterShown = false;
        counter!.style.opacity = "0";
        unlockInput?.();
        unlockInput = null;
        // Only now, with the page fully on screen, do its intros play.
        playIntros();
      });
    }

    /**
     * A fresh visit or refresh counts 000 → 100 over at least COUNT_MS (and
     * for as long as the page is really loading). Arriving through a page
     * transition just holds the word for a beat, and only brings the counter
     * in if the page is genuinely still loading after COUNTER_AFTER_MS.
     */
    function load(full: boolean) {
      setState("cover");
      unlockInput = lockInput();
      const started = performance.now();
      let loaded = false;
      const fonts = "fonts" in document ? document.fonts.ready : Promise.resolve();
      const windowLoaded = document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_LOAD_MS));
      void Promise.race([Promise.all([fonts, windowLoaded]), timeout]).then(() => { loaded = true; });

      let counting = false;
      let shown = 0;
      const tick = (now: number) => {
        if (disposed) return;
        const elapsed = now - started;
        if (!counting && (full || (!loaded && elapsed >= COUNTER_AFTER_MS))) {
          counting = true;
          counterShown = true;
          setCounter(0);
          counter!.style.opacity = "1";
        }
        if (counting) {
          const timed = easeOut(clamp01((elapsed - (full ? 0 : COUNTER_AFTER_MS)) / COUNT_MS));
          // Creep toward 90 until everything has loaded, then finish. A full
          // load always runs the whole count; a transition's can finish early.
          const goal = loaded ? (full ? timed : 1) : Math.min(timed, 0.9);
          shown += (goal - shown) * (loaded ? 0.25 : 0.18);
          if (Math.abs(goal - shown) < 0.004) shown = goal;
          setCounter(shown);
        }
        // 0.995 already reads as 100; don't sit on it while the curve's tail settles.
        if (loaded && elapsed >= HOLD_MS && (!counting || shown >= 0.995)) {
          frame = window.setTimeout(reveal, counting ? 140 : 0) as unknown as number;
          return;
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    /** Flies back out to the word, then loads the next page under it. */
    function leave(href: string) {
      navigating = true;
      // Tells the next page it was reached by a transition, not a refresh.
      try { sessionStorage.setItem(TRANSITION_KEY, "1"); } catch {}
      unlockInput?.();
      unlockInput = lockInput();
      // Measure with the overlay laid out: while "open" it is display: none.
      setState("cover");
      geometry = measure();
      counterShown = false;
      counter!.style.opacity = "0";
      setState("flight");
      const from = depth > 0 ? depth : 1;
      fly(from, 0, EXIT_MS * from, CLOSE_EASE, () => {}, () => {
        setState("cover");
        window.location.assign(href);
      });
    }

    function onClick(event: MouseEvent) {
      if (navigating || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target instanceof Element) ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download") || link.hasAttribute("data-no-page-transition")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (or just a hash on it): leave it to the page's own handling.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      event.stopPropagation();
      navigating = true;
      // The menu closes first, then the transition plays (see HeroNav).
      const request = { handled: false, complete: () => leave(url.href) };
      window.dispatchEvent(new CustomEvent("site:close-menu-for-navigation", { detail: request }));
      if (!request.handled) request.complete();
    }

    // Back/forward cache restores the page as we left it: on the word.
    function onPageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      navigating = false;
      depth = 0;
      setCounter(1);
      holdIntros();
      reveal();
    }

    width = window.innerWidth;
    height = window.innerHeight;
    resize();
    let arrived = false;
    try {
      arrived = sessionStorage.getItem(TRANSITION_KEY) === "1";
      sessionStorage.removeItem(TRANSITION_KEY);
    } catch {}
    load(!arrived);
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("click", onClick, true);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(frame);
      unlockInput?.();
      // Intros stay held: in development React remounts this straight away,
      // and the remount (not this cleanup) decides when they play.
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={overlayRef} className={styles.overlay} data-state="cover" aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.word}>
        {/* One line box, so the probe shares the word's baseline. */}
        <span>
          <span ref={wordRef}>Bytes</span>
          {/* The full stop is drawn as a true circle. */}
          <i ref={dotRef} className={styles.dot} />
          <i ref={baselineRef} className={styles.baseline} />
        </span>
      </div>
      <span ref={counterRef} className={styles.counter}>000</span>
    </div>
  );
}
