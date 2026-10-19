"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/animation/prefs";

/** The line's words; the regions light up blue while it's hovered. */
const WORDS: { text: string; region?: boolean }[] = [
  { text: "Proudly" },
  { text: "serving" },
  { text: "in" },
  { text: "USA,", region: true },
  { text: "Middle", region: true },
  { text: "East", region: true },
  { text: "and" },
  { text: "Africa", region: true },
];

/**
 * The hero's meta line. Each word sits in its own clipped slot so the hero's
 * entrance can lift it in (data-meta-part) and the line can wrap on phones.
 *
 * Playful bit: touching a word bounces it, and the bounce ripples out to its
 * neighbours, smaller the further away they are. A tap on touch screens sends
 * a wave across the whole line. Hovering lights the regions blue, one by one.
 */
export default function ServingLine() {
  const line = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = line.current;
    if (!el || prefersReducedMotion()) return;
    // The slots hop, not the words inside them: the entrance owns the words'
    // transforms, and a hopping word would be clipped by its own slot.
    const slots = [...el.querySelectorAll<HTMLElement>("[data-meta-slot]")];

    const ripple = (from: number, height: number, spread: number) => {
      slots.forEach((slot, i) => {
        const distance = Math.abs(i - from);
        const lift = height * Math.max(0, 1 - distance / spread);
        if (lift < 0.5) return;
        gsap.timeline({ delay: distance * 0.05 })
          .to(slot, { y: -lift, rotate: (i < from ? -1 : i > from ? 1 : 0) * lift * 0.6, duration: 0.18, ease: "power2.out", overwrite: true })
          .to(slot, { y: 0, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
      });
    };

    const offs = slots.map((slot, i) => {
      const onEnter = (e: PointerEvent) => { if (e.pointerType === "mouse") ripple(i, 7, 3); };
      slot.addEventListener("pointerenter", onEnter);
      return () => slot.removeEventListener("pointerenter", onEnter);
    });
    // Touch: a tap anywhere on the line waves across it from the start.
    const onTap = (e: PointerEvent) => { if (e.pointerType !== "mouse") ripple(0, 8, slots.length + 1); };
    el.addEventListener("pointerdown", onTap);

    return () => {
      offs.forEach(off => off());
      el.removeEventListener("pointerdown", onTap);
      gsap.killTweensOf(slots);
      gsap.set(slots, { clearProps: "transform" });
    };
  }, []);

  return (
    <p ref={line} className="hero-meta group flex flex-wrap gap-x-[0.5em] gap-y-1 !text-ink sm:!text-[0.8125rem]">
      {WORDS.map(({ text, region }, i) => (
        <span key={text} data-meta-slot className="inline-block overflow-hidden align-top">
          <span
            data-meta-part
            style={region ? { transitionDelay: `${i * 40}ms` } : undefined}
            className={`inline-block ${region ? "transition-colors duration-300 group-hover:text-blue" : ""}`}
          >
            {text}
          </span>
        </span>
      ))}
    </p>
  );
}
