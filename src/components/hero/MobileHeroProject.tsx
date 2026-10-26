"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/animation/prefs";
import styles from "./MobileHeroProject.module.css";

/** The blob outline (public/hero/mobile-hero-blob.svg), in its 494 × 545 box. */
const BLOB_PATH =
  "M57.9917 55.5991C4.31499 76.0939 -11.316 154.516 37.9922 208.599C68.9906 242.6 63.9921 266.599 22.9925 297.599C-3.63921 317.735 -3.90473 343.38 5.99249 371.599C14.1761 394.931 26.7861 418.246 72.9925 451.099C118.477 483.438 150.121 480.673 202.993 460.099C245.864 443.416 291.992 454.598 314.992 496.599C337.992 538.599 401.992 560.6 444.992 532.099C487.992 503.599 490.412 462.277 466.492 419.099C442.573 375.92 449.992 339.598 473.992 301.599C497.992 263.599 502.492 211.099 473.992 170.099C445.492 129.099 410.75 123.97 343.492 123.599C304.336 123.382 277.733 100.648 266.992 61.0987C260.01 35.3867 255.606 21.4489 234.993 11.0993C197.32 -7.81544 155.992 -1.40086 124.492 21.5994C92.9925 44.5997 85.4917 45.0991 57.9917 55.5991Z";
const WIDTH = 494;
const HEIGHT = 545;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
/** Idle wobble, in path units (the blob is ~250 units in radius). */
const WOBBLE = 9;
/** The outline already touches its box; inset it so bulges aren't cut flat. */
const INSET = 0.95;

// The path as commands and coordinate pairs, so each frame can rebuild it.
const tokens = BLOB_PATH.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g)!;

/** Rebuilds the outline with every point pushed in/out along its angle. */
function wobblePath(time: number, amount: number) {
  let out = "";
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/[A-Za-z]/.test(token)) { out += token; continue; }
    const x = Number(token);
    const y = Number(tokens[++i]);
    const angle = Math.atan2(y - CENTER.y, x - CENTER.x);
    // Overlapping slow waves around the rim: neighbouring points (an anchor
    // and its handles) share nearly the same angle, so curves stay smooth.
    const push = amount * (
      Math.sin(angle * 3 + time * 0.9) * 0.55 +
      Math.sin(angle * 5 - time * 1.25 + 1.7) * 0.3 +
      Math.sin(angle * 2 + time * 0.55 + 4.1) * 0.35
    );
    const px = CENTER.x + (x - CENTER.x) * INSET + Math.cos(angle) * push;
    const py = CENTER.y + (y - CENTER.y) * INSET + Math.sin(angle) * push;
    out += `${px.toFixed(2)} ${py.toFixed(2)} `;
  }
  return out;
}

/** The inset outline at rest (also the server render and reduced motion). */
const RESTING_PATH = wobblePath(0, 0);

/**
 * The phone hero's project blob. It drops in once the site loader has
 * revealed the page (GSAP is held until then), then idles: the outline
 * flows like liquid while the blob floats and sways.
 */
export default function MobileHeroProject() {
  const clipId = `mobile-hero-blob-${useId().replace(/:/g, "")}`;
  const blobRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    const path = pathRef.current;
    if (!blob || !path || prefersReducedMotion()) return;

    // 0 → 1 as the blob arrives: from a small, soft, extra-wobbly drop.
    const entry = { p: 0 };
    const intro = gsap.to(entry, { p: 1, duration: 1.8, delay: 0.15, ease: "power3.out" });

    let frame = 0;
    let visible = true;
    const started = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      const t = (now - started) / 1000;
      const p = entry.p;
      const settle = 1 - p;
      path.setAttribute("d", wobblePath(t, WOBBLE * (1 + settle * 3.5)));
      const float = Math.sin(t * 0.7) * 6;
      const sway = Math.sin(t * 0.45 + 1) * 1.2;
      const scale = 0.62 + 0.38 * gsap.parseEase("back.out(1.6)")(p);
      blob.style.transform = `translate3d(0, ${(float + settle * 40).toFixed(2)}px, 0) rotate(${(sway - settle * 8).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      blob.style.opacity = String(Math.min(1, p * 2.2));
      blob.style.filter = settle > 0.01 ? `blur(${(settle * 14).toFixed(2)}px)` : "";
    };
    frame = requestAnimationFrame(tick);

    // Off screen (scrolled past, or hidden above the phone breakpoint): idle.
    const observer = new IntersectionObserver(([entryInfo]) => { visible = entryInfo.isIntersecting; });
    observer.observe(blob);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intro.kill();
      blob.style.transform = "";
      blob.style.opacity = "";
      blob.style.filter = "";
      path.setAttribute("d", wobblePath(0, 0));
    };
  }, []);

  return (
    <div className={styles.stage} aria-hidden="true">
      {/* The outline as a clip path (bounding-box units, so it scales with the
          blob), rewritten every frame for the liquid edge. */}
      <svg width="0" height="0" className={styles.defs} focusable="false">
        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
          <path ref={pathRef} d={RESTING_PATH} transform={`scale(${1 / WIDTH} ${1 / HEIGHT})`} />
        </clipPath>
      </svg>
      <div ref={blobRef} className={styles.blob} style={{ clipPath: `url(#${clipId})` }}>
        <img
          src="/hero/mobile-blob-image-1.png"
          alt=""
          className={styles.image}
          draggable={false}
        />
      </div>
    </div>
  );
}
