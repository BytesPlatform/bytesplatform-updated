"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import HeroNav from "./HeroNav";
import HeroTypography from "./HeroTypography";

import { prefersReducedMotion, fontsReady } from "@/lib/animation/prefs";
import { mountScroll } from "@/lib/animation/scroll";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = <T extends Element>(s: string) => el.querySelector<T>(s);

    const hero = q<HTMLElement>("[data-hero]");
    const word = q<HTMLElement>("[data-word]");
    const period = q<HTMLElement>("[data-period]");
    if (!hero || !word) return;

    const reduced = prefersReducedMotion();
    let releaseScroll: (() => void) | null = null;

    // ----------------------------------------------------------- the period
    let periodTl: gsap.core.Timeline | null = null;
    const onPeriodEnter = () => {
      if (reduced) return;
      periodTl?.kill();
      periodTl = gsap.timeline();
      periodTl.to(period, { scale: 1.16, duration: 0.5, ease: "expo.out" }, 0);
    };
    const onPeriodLeave = () => {
      if (reduced) return;
      gsap.to(period, { scale: 1, duration: 0.7, ease: "expo.out" });
    };
    period?.addEventListener("pointerenter", onPeriodEnter);
    period?.addEventListener("pointerleave", onPeriodLeave);

    // ------------------------------------------------------- the word morph
    // Every letter starts as a blurred blob; the #hero-morph threshold turns
    // the blur into hard-edged liquid. The tracking starts tight so the blobs
    // merge, then opens as they condense into letterforms, left to right. At
    // the end the threshold relaxes to identity and the filter comes off, so
    // the word is left as plain, antialiased text.
    let morphTl: gsap.core.Timeline | null = null;
    let finishMorph: (() => void) | null = null;
    let cancelled = false;

    function runMorph() {
      const chars = Array.from(word!.querySelectorAll<HTMLElement>("[data-char]"));
      const matrix = el!.querySelector("[data-morph-matrix]");
      if (!chars.length || !matrix) {
        word!.dataset.morph = "done";
        return;
      }

      const cs = getComputedStyle(word!);
      const size = parseFloat(cs.fontSize) || 100;
      const tracking = parseFloat(cs.letterSpacing) || 0;

      /** alpha' = slope · alpha + offset — steep = liquid, (1, 0) = identity */
      const threshold = { slope: 22, offset: -10 };
      const writeMatrix = () =>
        matrix.setAttribute(
          "values",
          `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold.slope} ${threshold.offset}`,
        );
      writeMatrix();

      gsap.set(chars, { opacity: 0, filter: `blur(${size * 0.28}px)` });
      gsap.set(word, { letterSpacing: `${tracking - size * 0.09}px` });
      word!.dataset.morph = "run";

      const finish = () => {
        word!.dataset.morph = "done";
        gsap.set(chars, { clearProps: "opacity,filter" });
        gsap.set(word, { clearProps: "letterSpacing" });
        finishMorph = null;
      };
      finishMorph = finish;

      const STAGGER = 0.07;
      const SHARPEN = 1.3;
      /** when the last letter is all but sharp */
      const sharp = STAGGER * (chars.length - 1) + SHARPEN - 0.4;

      morphTl = gsap.timeline({ onComplete: finish });
      morphTl
        .to(chars, { opacity: 1, duration: 0.5, ease: "power1.out", stagger: STAGGER }, 0)
        .to(chars, { filter: "blur(0px)", duration: SHARPEN, ease: "power3.out", stagger: STAGGER }, 0)
        .to(word, { letterSpacing: `${tracking}px`, duration: 1.8, ease: "expo.out" }, 0.1)
        // relax the threshold to identity so the edges regain antialiasing
        .to(threshold, {
          slope: 1,
          offset: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onUpdate: writeMatrix,
        }, sharp);
    }

    // ------------------------------------------------------------- startup
    // Reduced motion: the composition is simply there — no morph, no trail,
    // no parallax.
    if (reduced) {
      word.dataset.morph = "done";
      releaseScroll = mountScroll({ smooth: false });
      return cleanup;
    }

    releaseScroll = mountScroll({ smooth: true });
    // wait for the webfont so the letters condense into their final shapes
    fontsReady(900).then(() => {
      if (!cancelled) runMorph();
    });

    function cleanup() {
      cancelled = true;
      morphTl?.kill();
      // never leave the word blurred or filtered behind a killed timeline
      finishMorph?.();
      periodTl?.kill();
      period?.removeEventListener("pointerenter", onPeriodEnter);
      period?.removeEventListener("pointerleave", onPeriodLeave);
      releaseScroll?.();
    }

    return cleanup;
  }, []);

  return (
    <div ref={root}>
      <div
        data-hero
        id="top"
        className="relative flex h-[100svh] flex-col justify-between overflow-clip"
      >
        <HeroNav />

        <div className="relative z-10 flex flex-1 items-end px-[var(--bp-gut)] pb-5 sm:pb-[8svh]">
          <HeroTypography />
        </div>

        <div
          data-hero-foot
          className="relative z-10 flex flex-col gap-6 px-[var(--bp-gut)] pb-[var(--bp-gut)] sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="hero-meta whitespace-nowrap">
            Technology studio
            <span className="mx-2 opacity-40">/</span>
            Texas
          </p>

          {/* Phones only: the nav drops its "Start a project" below 640px, so the
              hero carries it as a full-width button. */}
          <a
            href="/contact"
            className="flex h-14 items-center justify-center gap-3 rounded-full bg-[#1f2028] text-[0.95rem] font-medium text-paper transition-colors duration-300 active:bg-blue sm:hidden"
          >
            Start a project
            <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.2 12.8 12.8 3.2m0 0H5.4m7.4 0v7.4" />
            </svg>
          </a>

        </div>
      </div>
    </div>
  );
}
