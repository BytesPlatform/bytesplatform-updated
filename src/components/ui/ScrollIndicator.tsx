"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollIndicator.module.css";

/** How long the indicator lingers after the last scroll movement. */
const IDLE_MS = 500;

/**
 * Stands in for the hidden native scrollbar: a short track at the right edge
 * whose pill shows how far down the page you are. It only reports progress
 * (it can't be dragged), and only appears while the page is moving.
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
    let idle = 0;
    let lastY = window.scrollY;

    // Pick dark or light by reading the background behind the track. (Not
    // mix-blend-mode: mobile Safari doesn't blend fixed layers with the page,
    // so a blended pill rendered as paper on paper — invisible on phones.)
    const tone = () => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      for (const node of document.elementsFromPoint(x, y)) {
        const match = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(getComputedStyle(node).backgroundColor);
        if (!match || (match[4] !== undefined && Number(match[4]) < 0.5)) continue;
        const [r, g, b] = [match[1], match[2], match[3]].map(Number);
        el.dataset.tone = 0.2126 * r + 0.7152 * g + 0.0722 * b < 128 ? "dark" : "light";
        return;
      }
      el.dataset.tone = "light";
    };

    const paint = () => {
      frame = 0;
      tone();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // The pill travels the free length of the track, never past its ends.
      pill.style.transform = `translateY(calc(${progress} * (var(--track) - var(--thumb))))`;
    };

    const onScroll = () => {
      // Programmatic layout jumps of a pixel or less aren't the reader scrolling.
      if (Math.abs(window.scrollY - lastY) < 1) return;
      lastY = window.scrollY;
      el.dataset.visible = "true";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => { el.dataset.visible = "false"; }, IDLE_MS);
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <div ref={root} className={styles.indicator} data-visible="false" data-tone="light" aria-hidden>
      <span ref={thumb} className={styles.thumb} />
    </div>
  );
}
