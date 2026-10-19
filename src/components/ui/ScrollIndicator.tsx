"use client";

import { useEffect, useRef } from "react";
import { endScrub, scrubTo } from "@/lib/animation/scroll";
import styles from "./ScrollIndicator.module.css";

/**
 * Stands in for the hidden native scrollbar: a short track at the right edge
 * whose pill shows how far down the page you are. It stays on screen, and it
 * scrolls the page too: drag the pill, or press anywhere on the track to bring
 * the pill there and keep dragging.
 *
 * Hidden while <html data-scroll-locked> is set, e.g. by the showreel player.
 */
export default function ScrollIndicator() {
  const root = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const pill = thumb.current;
    if (!el || !pill) return;
    let frame = 0;

    // Pick dark or light by reading the background behind the track. (Not
    // mix-blend-mode: mobile Safari doesn't blend fixed layers with the page,
    // so a blended pill rendered as paper on paper — invisible on phones.)
    const tone = () => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      for (const node of document.elementsFromPoint(x, y)) {
        // The indicator takes pointer events now, so skip its own layers.
        if (el.contains(node)) continue;
        const match = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(getComputedStyle(node).backgroundColor);
        if (!match || (match[4] !== undefined && Number(match[4]) < 0.5)) continue;
        const [r, g, b] = [match[1], match[2], match[3]].map(Number);
        el.dataset.tone = 0.2126 * r + 0.7152 * g + 0.0722 * b < 128 ? "dark" : "light";
        return;
      }
      el.dataset.tone = "light";
    };

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    const paint = () => {
      frame = 0;
      tone();
      const max = maxScroll();
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // The pill travels the free length of the track, never past its ends.
      pill.style.transform = `translateY(calc(${progress} * (var(--track) - var(--thumb))))`;
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(paint); };

    // ------------------------------------------------------------ dragging
    // Where on the pill it was grabbed, so it doesn't jump under the pointer.
    let grab = 0;
    let dragging: number | null = null;
    const scrubToPointer = (clientY: number) => {
      const track = el.getBoundingClientRect();
      const free = track.height - pill.offsetHeight;
      if (free <= 0) return;
      const progress = Math.min(1, Math.max(0, (clientY - track.top - grab) / free));
      scrubTo(progress * maxScroll());
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = pill.getBoundingClientRect();
      const onPill = e.clientY >= rect.top && e.clientY <= rect.bottom;
      // On the pill: hold it where it was grabbed. On the track: centre it there.
      grab = onPill ? e.clientY - rect.top : pill.offsetHeight / 2;
      dragging = e.pointerId;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "true";
      scrubToPointer(e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId === dragging) scrubToPointer(e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== dragging) return;
      dragging = null;
      el.dataset.dragging = "false";
      endScrub();
    };

    paint();
    // What's behind the track also changes without any scrolling: the site
    // loader lifting off the hero, a menu opening. Keep the tone current, or
    // the pill can load light-on-light and stay invisible until a scroll.
    const toneCheck = window.setInterval(tone, 250);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint, { passive: true });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      window.cancelAnimationFrame(frame);
      window.clearInterval(toneCheck);
      if (dragging !== null) endScrub();
    };
  }, []);

  return (
    <div ref={root} className={styles.indicator} data-tone="light" data-dragging="false" data-lenis-prevent aria-hidden>
      <span ref={thumb} className={styles.thumb} />
    </div>
  );
}
