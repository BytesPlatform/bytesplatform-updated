"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/animation/prefs";
import { jumpTo } from "@/lib/animation/scroll";
import { createDiveScene } from "@/lib/fluid/diveScene";
import ActionPill from "@/components/ui/ActionPill";
import "./ServicesSection.css";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  { label: "AI Automation & AI Agents", href: "/services/ai-automation" },
  { label: "Custom SaaS & Product Development", href: "/services/saas-product-development" },
  { label: "Web & Mobile App Development", href: "/services/web-mobile-app-development" },
  { label: "CRM & ERP Systems", href: "/services/crm-erp-systems" },
  { label: "Government Opportunity & Proposal Technology", href: "/services/government-proposal-technology" },
  { label: "E-Invoicing & Business System Integration", href: "/services/e-invoicing-integration" },
] as const;
const SERVICE_ANGLES = [-8, 9, 7, -6, 5, -6];
const STACK_LEAD_IN_SCREENS = 0.82;
const STACK_SCROLL_SCREENS = STACK_LEAD_IN_SCREENS + SERVICES.length + 0.65;
// Same short beat as the original handoff: the dive starts just after the pill
// has scaled in, and the section ends right behind it.
const DIVE_START_SCREENS = STACK_SCROLL_SCREENS + 0.04;
const HANDOFF_SCROLL_SCREENS = STACK_SCROLL_SCREENS + 0.06;

export default function ServicesSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    const handoff = section?.querySelector<HTMLElement>("[data-services-handoff]");
    const stage = section?.querySelector<HTMLElement>("[data-services-stage]");
    const pillWrap = section?.querySelector<HTMLElement>("[data-services-pill-wrap]");
    const pill = section?.querySelector<HTMLElement>("[data-services-pill]");
    const overlay = document.querySelector<HTMLElement>("[data-services-dive-overlay]");
    const canvasLayer = document.querySelector<HTMLCanvasElement>("[data-intro-canvas]")?.parentElement;
    const next = document.querySelector<HTMLElement>("[data-featured-work]");
    if (!section || !handoff || !stage || !pillWrap || !pill || !overlay || !next) return;

    const reduced = prefersReducedMotion();
    const context = gsap.context(() => {
      if (reduced) return;
      const upperWords = gsap.utils.toArray<HTMLElement>("[data-heading-upper] > span");
      const lowerWords = gsap.utils.toArray<HTMLElement>("[data-heading-lower] > span");
      const heading = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 72%", toggleActions: "play none none reverse" } });
      heading
        .fromTo(upperWords, { xPercent: -135, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.15, stagger: { each: 0.12, from: "end" }, ease: "expo.out" })
        .fromTo(lowerWords, { xPercent: 120, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 0.16);

      const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]");
      const finalCardEnd = STACK_LEAD_IN_SCREENS + SERVICES.length - 1 + 0.74;
      const stackPoint = (depth: number) => ({
        x: depth === 0 ? 0 : (depth % 2 ? 1 : -1) * Math.ceil(depth / 2) * 12,
        y: -depth * 13,
        rotation: depth === 0 ? 0 : (depth % 2 ? 1 : -1) * depth * 1.65,
        scale: 1 - depth * 0.027,
        autoAlpha: 1 - depth * 0.045,
        filter: `blur(${depth * 0.25}px)`,
      });
      const stackTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: handoff,
          start: "top top",
          end: () => `+=${window.innerHeight * STACK_SCROLL_SCREENS}`,
          // Lenis already eases wheel input; a shorter scrub keeps the cards
          // visually attached to the scroll position instead of trailing it.
          scrub: 0.22,
          invalidateOnRefresh: true,
        },
      });
      cards.forEach((card, index) => {
        const point = stackPoint(index);
        const visual = card.querySelector<HTMLElement>("[data-service-card-visual]");
        const surface = card.querySelector<HTMLElement>("[data-service-surface]");
        const angle = SERVICE_ANGLES[index] + point.rotation;
        stackTimeline.set(card, { x: point.x, y: point.y, scale: point.scale, autoAlpha: point.autoAlpha, filter: point.filter, transformOrigin: "50% 50%" }, 0);
        if (surface) stackTimeline.set(surface, { rotation: angle, transformOrigin: "50% 50%" }, 0);
        if (visual) stackTimeline.set(visual, { "--service-exit": 0, "--service-angle": angle }, 0);
      });
      cards.forEach((card, index) => {
        const visual = card.querySelector<HTMLElement>("[data-service-card-visual]");
        const surface = card.querySelector<HTMLElement>("[data-service-surface]");
        const direction = index % 2 === 0 ? -1 : 1;
        const exitAngle = SERVICE_ANGLES[index] + direction * (25 + index * 2);
        stackTimeline.to(card, {
          x: () => direction * window.innerWidth * 0.92,
          y: () => -window.innerHeight * (index % 3 === 0 ? 0.12 : 0.2),
          scale: 0.76,
          autoAlpha: 0,
          filter: "blur(12px)",
          duration: 0.74,
          ease: "power2.in",
        }, STACK_LEAD_IN_SCREENS + index);
        if (surface) stackTimeline.to(surface, { rotation: exitAngle, duration: 0.74, ease: "power2.in" }, STACK_LEAD_IN_SCREENS + index);
        if (visual) stackTimeline.to(visual, { "--service-exit": 1, "--service-angle": exitAngle, duration: 0.74, ease: "power2.in" }, STACK_LEAD_IN_SCREENS + index);
        cards.slice(index + 1).forEach((nextCard, nextIndex) => {
          const point = stackPoint(nextIndex);
          const nextVisual = nextCard.querySelector<HTMLElement>("[data-service-card-visual]");
          const nextSurface = nextCard.querySelector<HTMLElement>("[data-service-surface]");
          const angle = SERVICE_ANGLES[index + 1 + nextIndex] + point.rotation;
          stackTimeline.to(nextCard, {
            x: point.x,
            y: point.y,
            scale: point.scale,
            autoAlpha: point.autoAlpha,
            filter: point.filter,
            duration: 0.3,
            ease: "power3.inOut",
          }, STACK_LEAD_IN_SCREENS + index + 0.62);
          if (nextSurface) stackTimeline.to(nextSurface, { rotation: angle, duration: 0.3, ease: "power3.inOut" }, STACK_LEAD_IN_SCREENS + index + 0.62);
          if (nextVisual) stackTimeline.to(nextVisual, { "--service-exit": 0, "--service-angle": angle, duration: 0.3, ease: "power3.inOut" }, STACK_LEAD_IN_SCREENS + index + 0.62);
        });
      });
      // Pad the scrubbed timeline to its scroll length so one unit is one screen,
      // then scale the pill in exactly as before once the last card has left.
      stackTimeline.set({}, {}, STACK_SCROLL_SCREENS);
      stackTimeline.fromTo(pillWrap,
        { scale: 0.52, autoAlpha: 0, filter: "blur(16px)" },
        { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }, finalCardEnd);

    }, section);

    const dive = reduced ? null : createDiveScene({
      section: handoff,
      layers: canvasLayer ? [canvasLayer, stage] : [stage],
      pill,
      overlay,
      next,
      // Work now renders on the already-moving shared canvas; there is no
      // second canvas to settle independently on the far side of the dive.
      nextContent: () => null,
      startOffset: () => window.innerHeight * DIVE_START_SCREENS,
      ready: () => true,
      freeze: () => window.dispatchEvent(new Event("intro:dive-freeze")),
      thaw: () => window.dispatchEvent(new Event("intro:dive-thaw")),
      suspendOthers: () => {},
      setLoaderState: (progress, active, direction, holdWork) => window.dispatchEvent(new CustomEvent("intro:loader-state", {
        detail: { progress, active, direction, holdWork },
      })),
    });
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      dive?.kill();
      context.revert();
    };
  }, []);

  const enterWork = () => {
    const handoff = root.current?.querySelector<HTMLElement>("[data-services-handoff]");
    if (!handoff) return;
    jumpTo(handoff.getBoundingClientRect().top + window.scrollY + window.innerHeight * (DIVE_START_SCREENS + 0.01));
  };

  return (
    <section id="services" ref={root} data-services className="services-section relative">
      <header className="services-heading relative z-[2] overflow-hidden px-[var(--bp-gut)] py-[clamp(6rem,12vw,12rem)]">
        <h2 className="mx-auto w-full max-w-[1800px] text-[clamp(4.25rem,10.8vw,12rem)] font-normal leading-[0.9] tracking-[-0.075em] text-ink">
          <span data-heading-upper className="flex flex-wrap gap-x-[0.22em]">
            <span>What</span><span>we</span><span>do,</span>
          </span>
          <span data-heading-lower className="flex flex-wrap gap-x-[0.22em] lg:pl-[8%]">
            <span>built</span><span>to</span><span>perform.</span>
          </span>
        </h2>
      </header>

      <div
        data-services-handoff
        className="services-handoff relative z-[2]"
        style={{ height: `calc(100svh * ${HANDOFF_SCROLL_SCREENS + 1})` }}
        aria-label="Our services"
      >
        <div data-services-stage className="services-stage sticky top-0 h-[100svh] overflow-hidden px-[var(--bp-gut)]">
          <div className="services-stack relative mx-auto h-full max-w-[1800px]">
            <div data-services-pill-wrap className="services-pill-wrap absolute inset-0 z-20 flex items-center justify-center">
              <ActionPill portal label="View featured work" onClick={enterWork} className="pointer-events-auto" />
            </div>

            {SERVICES.map((service, index) => (
              <div
                data-service-card
                data-service-index={index}
                key={service.href}
                className={`service-orbit-card service-orbit-card--${index + 1} absolute`}
                style={{ zIndex: SERVICES.length - index }}
              >
                <div data-service-float data-service-card-visual data-service-index={index} className="service-orbit-card__float" style={{ "--service-exit": 0, "--service-angle": SERVICE_ANGLES[index] } as React.CSSProperties}>
                  <div data-service-surface className="service-orbit-card__surface">
                    <a href={service.href} aria-label={service.label} className="service-orbit-card__body block h-full w-full rounded-[1.6rem] bg-transparent focus-visible:outline-2 focus-visible:outline-blue" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
