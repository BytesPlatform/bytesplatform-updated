"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/animation/prefs";
import { Rule, Words } from "./reveal";
import "./StatsSection.css";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 2, label: "Years of continual excellence" },
  { value: 300, label: "Successful projects deployed" },
  { value: 90, label: "Employees" },
] as const;

/**
 * BY THE NUMBERS — the first part of the closing sheet that slides over Work.
 * Entrance: the rule draws in, the heading rises word by word, then each
 * stat's rule draws, its figure lifts and counts up, and its label settles.
 */
export default function StatsSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    // These sections sit below Work's pin, which is created later (once its
    // scene loads). refreshPriority -1 makes ScrollTrigger measure these
    // after every pin, or their start positions land a pin's length too early.
    // Hidden states are set up front (gsap.set) and the timelines tween *to*
    // the resting state: ScrollTrigger's refresh reverts from()-tweens, which
    // would otherwise leave everything visible until the trigger fires.
    const context = gsap.context(() => {
      const ease = "expo.out";
      const trigger = (el: string) => ({ trigger: el, start: "top 80%", toggleActions: "play none none reverse", refreshPriority: -1 });

      gsap.set("[data-stats-head] [data-rule]", { scaleX: 0 });
      gsap.set("[data-stats-head] [data-eyebrow] > :not([data-rule])", { x: -16, opacity: 0 });
      gsap.set("[data-stats-head] [data-word]", { yPercent: 115 });
      gsap.timeline({ scrollTrigger: trigger("[data-stats-head]") })
        .to("[data-stats-head] [data-rule]", { scaleX: 1, duration: 1.4, ease: "power3.inOut" })
        .to("[data-stats-head] [data-eyebrow] > :not([data-rule])", { x: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease }, 0.2)
        .to("[data-stats-head] [data-word]", { yPercent: 0, duration: 1.2, stagger: 0.07, ease }, 0.25);

      const stats = gsap.timeline({ scrollTrigger: { ...trigger("[data-stats-list]"), start: "top 85%" } });
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((stat, index) => {
        const at = index * 0.14;
        const value = stat.querySelector<HTMLElement>("[data-stat-value]")!;
        const counter = { n: 0 };
        const parts = {
          rule: stat.querySelector("[data-rule]"),
          index: stat.querySelector("[data-stat-index]"),
          figure: stat.querySelector("[data-stat-figure]"),
          plus: stat.querySelector("[data-stat-plus]"),
          label: stat.querySelector("dt"),
        };
        gsap.set(parts.rule, { scaleX: 0 });
        gsap.set(parts.index, { opacity: 0, y: 10 });
        gsap.set(parts.figure, { yPercent: 60, opacity: 0 });
        gsap.set(parts.plus, { scale: 0, rotate: -90 });
        gsap.set(parts.label, { y: 18, opacity: 0 });
        stats
          .to(parts.rule, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, at)
          .to(parts.index, { opacity: 1, y: 0, duration: 0.8, ease }, at + 0.2)
          .to(parts.figure, { yPercent: 0, opacity: 1, duration: 1.3, ease }, at + 0.15)
          .fromTo(counter, { n: 0 }, {
            n: Number(value.dataset.statValue),
            duration: 1.8,
            ease: "power3.out",
            immediateRender: false,
            onUpdate: () => { value.textContent = String(Math.round(counter.n)); },
          }, at + 0.15)
          .to(parts.plus, { scale: 1, rotate: 0, duration: 0.9, ease: "back.out(2)" }, at + 0.55)
          .to(parts.label, { y: 0, opacity: 1, duration: 1, ease }, at + 0.4);
      });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="stats-heading"
      className="px-[var(--bp-gut)] pb-[clamp(4rem,10vh,7rem)] pt-[clamp(6rem,18vh,12rem)]"
    >
      <div className="mx-auto max-w-[1800px]">
        <div data-stats-head>
          <div data-eyebrow className="relative flex items-center gap-[0.7rem] pt-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">
            <Rule />
            <span className="hero-dot" aria-hidden />
            <span>By the numbers</span>
          </div>

          <h2
            id="stats-heading"
            className="mt-[clamp(2rem,5vw,4rem)] max-w-[14ch] text-[clamp(2.4rem,5vw,5rem)] font-medium leading-[1] tracking-[-0.055em] text-ink"
          >
            <Words text="Proven in practice" tail={<span className="text-blue">.</span>} />
          </h2>
        </div>

        <dl data-stats-list className="mt-[clamp(3.5rem,8vw,7rem)] grid gap-y-12 md:grid-cols-3 md:gap-x-[clamp(1.5rem,3vw,3rem)]">
          {STATS.map((stat, index) => (
            <div key={stat.label} data-stat className="relative flex flex-col pt-5">
              <Rule />
              <span data-stat-index className="order-1 text-[0.72rem] font-semibold tabular-nums tracking-[0.14em] text-ink-mute">
                {String(index + 1).padStart(2, "0")}
              </span>
              {/* dt before dd for valid markup; flex order puts the figure first. */}
              <dt className="order-3 mt-5 max-w-[22ch] text-[clamp(1rem,1.2vw,1.2rem)] leading-[1.4] tracking-[-0.015em] text-ink-mute">
                {stat.label}
              </dt>
              {/* The clip lets the figure rise into place from below its baseline. */}
              <dd className="order-2 mt-[clamp(1.5rem,3vw,2.75rem)] overflow-hidden pb-[0.08em] text-[clamp(4.5rem,10vw,10rem)] font-medium leading-[0.85] tracking-[-0.07em] text-ink tabular-nums">
                <span data-stat-figure className="inline-block">
                  <span data-stat-value={stat.value}>{stat.value}</span>
                  <span data-stat-plus className="inline-block text-blue">+</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
