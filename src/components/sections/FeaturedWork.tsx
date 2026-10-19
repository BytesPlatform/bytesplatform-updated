"use client";

import { useEffect, useRef } from "react";
import { Montserrat } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COMPACT_QUERY, prefersReducedMotion } from "@/lib/animation/prefs";
import "./FeaturedWork.css";

gsap.registerPlugin(ScrollTrigger);

const montserrat = Montserrat({ subsets: ["latin"], weight: "500", display: "swap" });

/** Work's drift under Stats: a fraction of the scroll (IntroExperience). */
const WORK_PARALLAX = 0.35;

/**
 * FEATURED WORK — the root and card spiral (lib/work/rootCardsScene).
 *
 * The section pins while the page scrolls through SCROLL_LENGTH; that scroll,
 * as 0..1, is the scene's scroll progress (the prototype used the whole
 * document's scroll — here it is this section's). The scene smooths toward
 * it and orbits the camera down the root.
 *
 * Tablets and phones have no dive (whose blue carries the title), so the
 * section shows its own caption there, low and centred between two rules.
 * As the section pins, the text slides up and fades in, then the rules grow
 * out from it; scrolling back above the pin hides it quickly.
 */
export default function FeaturedWork() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = heading.current;
    const section = el?.closest<HTMLElement>("[data-featured-work]");
    if (!el || !section || prefersReducedMotion()) return;
    const media = gsap.matchMedia();
    media.add(COMPACT_QUERY, () => {
      const text = el.querySelector("[data-work-heading-text]");
      const rules = el.querySelectorAll("[data-work-heading-rule]");
      gsap.set(text, { opacity: 0, y: 28 });
      gsap.set(rules, { scaleX: 0 });
      // In: the text rises and fades in, then the rules grow out from it.
      const enter = gsap.timeline({ paused: true })
        .to(text, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
        .to(rules, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 0.35);
      // Out, scrolling back: quick, and started while the section is still
      // pinned, so it fades in place instead of riding down with the section.
      let leave: gsap.core.Timeline | null = null;
      let shown = false;
      const show = () => { if (shown) return; shown = true; leave?.kill(); enter.restart(); };
      const hide = () => {
        if (!shown) return;
        shown = false;
        enter.pause();
        leave?.kill();
        leave = gsap.timeline()
          .to(text, { opacity: 0, y: 16, duration: 0.22, ease: "power2.in" }, 0)
          .to(rules, { scaleX: 0, duration: 0.22, ease: "power2.in" }, 0);
      };
      const pinned = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "max",
        // Measured after Work's pin (created later, in IntroExperience).
        refreshPriority: -1,
        onEnter: show,
        onLeaveBack: hide,
      });
      // The hide's early edge, a little way into the pin. Scrolling back down
      // past it shows the heading again if it was hidden there. In page pixels
      // off the pin's start: an offset on the pinned section itself would be
      // pushed past the whole pin.
      ScrollTrigger.create({
        start: () => pinned.start + window.innerHeight * 0.35,
        end: "max",
        refreshPriority: -1,
        onEnter: show,
        onLeaveBack: hide,
      });
      // After the pin, Work drifts up slowly while Stats slides over it (see
      // IntroExperience). The heading keeps to the scene: the unpinned section
      // rises at full speed, so offset it back to the scene's pace, and clip
      // it at Stats' top edge, which comes up over it.
      const stats = document.querySelector<HTMLElement>("[data-stats]");
      const follow = () => {
        const top = section.getBoundingClientRect().top;
        if (top >= 0) {
          if (el.style.transform) { el.style.transform = ""; el.style.clipPath = ""; }
          return;
        }
        el.style.transform = `translate3d(0, ${-top * (1 - WORK_PARALLAX)}px, 0)`;
        const box = el.getBoundingClientRect();
        const cover = stats ? box.bottom - stats.getBoundingClientRect().top : 0;
        el.style.clipPath = cover > 0 ? `inset(0 0 ${Math.min(box.height, cover)}px 0)` : "";
      };
      gsap.ticker.add(follow);
      // Arriving already inside the section (reload, anchor): show it as is.
      if (section.getBoundingClientRect().top <= 1) { shown = true; enter.progress(1); }
      return () => {
        gsap.ticker.remove(follow);
        el.style.transform = "";
        el.style.clipPath = "";
      };
    });
    return () => media.revert();
  }, []);

  return (
    <section
      id="work"
      data-featured-work
      aria-label="Featured work"
      className="relative h-[100svh] overflow-hidden rounded-b-[clamp(1.75rem,4vw,4rem)]"
    >
      <h2 ref={heading} aria-hidden className="work-heading">
        <span data-work-heading-rule className="work-heading__rule work-heading__rule--left" />
        <span data-work-heading-text className={`work-heading__text ${montserrat.className}`}>Featured Work</span>
        <span data-work-heading-rule className="work-heading__rule work-heading__rule--right" />
      </h2>
    </section>
  );
}
