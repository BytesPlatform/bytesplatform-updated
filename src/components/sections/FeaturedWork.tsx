"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COMPACT_QUERY, prefersReducedMotion } from "@/lib/animation/prefs";
import "./FeaturedWork.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * FEATURED WORK — the root and card spiral (lib/work/rootCardsScene).
 *
 * The section pins while the page scrolls through SCROLL_LENGTH; that scroll,
 * as 0..1, is the scene's scroll progress (the prototype used the whole
 * document's scroll — here it is this section's). The scene smooths toward
 * it and orbits the camera down the root.
 *
 * Tablets and phones have no dive (whose blue carries the title), so the
 * section shows its own heading there: it rises in as Services lifts off,
 * and lifts away as the pinned scene starts to move.
 */
export default function FeaturedWork() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = heading.current;
    const section = el?.closest<HTMLElement>("[data-featured-work]");
    if (!el || !section || prefersReducedMotion()) return;
    const media = gsap.matchMedia();
    media.add(COMPACT_QUERY, () => {
      const words = el.querySelectorAll("[data-work-word]");
      gsap.fromTo(words, { yPercent: 115, opacity: 0 }, {
        yPercent: 0, opacity: 1, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 85%", end: "top 30%", scrub: true },
      });
      gsap.fromTo(el, { y: 0, opacity: 1 }, {
        y: () => -window.innerHeight * 0.12, opacity: 0, ease: "power2.in", immediateRender: false,
        scrollTrigger: { trigger: section, start: "top top", end: "+=35%", scrub: true, invalidateOnRefresh: true },
      });
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
        <span className="work-heading__slot"><span data-work-word className="inline-block">Featured</span></span>{" "}
        <span className="work-heading__slot"><span data-work-word className="inline-block">Work</span></span>
      </h2>
    </section>
  );
}
