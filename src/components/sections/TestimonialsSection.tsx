"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/animation/prefs";
import { Rule, Words } from "./reveal";

gsap.registerPlugin(ScrollTrigger);

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/bytesplatform.com";

/** Trustpilot's mark: the green star, then the wordmark in the link's own ink. */
function TrustpilotLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.3em] font-semibold normal-case tracking-[-0.02em] ${className}`}>
      <svg viewBox="0 0 24 24" aria-hidden className="h-[1.15em] w-[1.15em] shrink-0 -translate-y-[0.06em]">
        <path fill="#00b67a" d="M12 1.2l2.65 8.15H23.2l-6.93 5.04 2.65 8.15L12 17.5l-6.92 5.04 2.64-8.15L.8 9.35h8.56z" />
        <path fill="#005128" d="M16.06 14.08l-.6-1.83L12 17.5z" />
      </svg>
      Trustpilot
    </span>
  );
}

/** Excerpts from our Trustpilot reviews (all rated 5 out of 5). */
const TESTIMONIALS = [
  {
    title: "Hands down the best",
    quote:
      "Matt has been helping me with my company’s website and the team has knocked it out of the park. Not only did they do my company’s website but they took on my company’s social media and excelled. Now I am giving them all of my other ventures.",
    name: "Robert Gilbert",
    url: "https://www.trustpilot.com/reviews/6aa5d771903e5a5b22e6c734",
    role: "Business owner",
    date: "Sep 2026",
  },
  {
    title: "Professional, responsive, and committed",
    quote:
      "They have taken the time to understand what we are trying to build rather than simply completing a list of technical tasks. Building a custom system from the ground up requires collaboration, flexibility, and trust, and so far Bytesplatform has demonstrated all three.",
    name: "Brenda Gatoru",
    url: "https://www.trustpilot.com/reviews/6a9c1329e690edbd7f159f5d",
    role: "Custom platform client",
    date: "Sep 2026",
  },
  {
    title: "A true technology partner",
    quote:
      "Their team transformed our vision into powerful, professional digital platforms. Their commitment went beyond simply completing a project. They approached the work as a true technology partner invested in our success.",
    name: "George Wrighster",
    url: "https://www.trustpilot.com/reviews/6a91e1a7610869a33ced841c",
    role: "Founder, QuantivaHQ",
    date: "Aug 2026",
  },
  {
    title: "Concept to finished product, faster than expected",
    quote:
      "Communication was constant. He grasped the objective early and translated it into a working product without losing the intent behind it, and the turnaround from concept to finished deliverable was faster than I planned for.",
    name: "John Glamdon",
    url: "https://www.trustpilot.com/reviews/6a90090b508fae6a228959ca",
    role: "GovCon software platform",
    date: "Aug 2026",
  },
] as const;

function Stars() {
  return (
    <span data-review-stars className="flex gap-[3px]" role="img" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" aria-hidden className="h-[0.95rem] w-[0.95rem] fill-blue">
          <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8l-5.3 2.9 1.2-5.9L1.4 7.7l6-.7z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * WHAT CLIENTS SAY — Trustpilot reviews, between Stats and Clients on the
 * closing sheet. Entrance mirrors Stats: rule, eyebrow and heading, then each
 * review's rule draws and its content rises in.
 */
export default function TestimonialsSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    // Hidden states set up front and tweened *to* rest (refresh-safe), and
    // measured after Work's late pin (refreshPriority -1); see StatsSection.
    const context = gsap.context(() => {
      const ease = "expo.out";
      const trigger = (el: string | Element, start = "top 80%") => ({ trigger: el, start, toggleActions: "play none none reverse", refreshPriority: -1 });

      gsap.set("[data-reviews-head] [data-rule]", { scaleX: 0 });
      gsap.set("[data-reviews-head] [data-eyebrow] > :not([data-rule])", { x: -16, opacity: 0 });
      gsap.set("[data-reviews-head] [data-word]", { yPercent: 115 });
      gsap.timeline({ scrollTrigger: trigger("[data-reviews-head]") })
        .to("[data-reviews-head] [data-rule]", { scaleX: 1, duration: 1.4, ease: "power3.inOut" })
        .to("[data-reviews-head] [data-eyebrow] > :not([data-rule])", { x: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease }, 0.2)
        .to("[data-reviews-head] [data-word]", { yPercent: 0, duration: 1.2, stagger: 0.07, ease }, 0.25);

      // Each review animates on its own as it scrolls in (the grid stacks on
      // phones), with the second column trailing the first a beat.
      gsap.utils.toArray<HTMLElement>("[data-review]").forEach((review, index) => {
        const at = (index % 2) * 0.14;
        const rule = review.querySelector("[data-rule]");
        const parts = review.querySelectorAll("[data-review-part]");
        gsap.set(rule, { scaleX: 0 });
        gsap.set(parts, { y: 24, opacity: 0 });
        gsap.timeline({ scrollTrigger: trigger(review, "top 88%") })
          .to(rule, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, at)
          .to(parts, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease }, at + 0.15);
      });

      gsap.set("[data-reviews-cta]", { y: 20, opacity: 0 });
      gsap.to("[data-reviews-cta]", { y: 0, opacity: 1, duration: 1, ease, scrollTrigger: trigger("[data-reviews-cta]", "top 92%") });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="reviews-heading"
      className="px-[var(--bp-gut)] pb-[clamp(3rem,8vh,6rem)] pt-[clamp(3rem,8vh,6rem)]"
    >
      <div className="mx-auto max-w-[1800px]">
        <div data-reviews-head>
          <div data-eyebrow className="relative flex items-center gap-[0.7rem] pt-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">
            <Rule />
            <span className="hero-dot" aria-hidden />
            <span>What clients say</span>
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-[0.55em] whitespace-nowrap underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Reviews on <TrustpilotLogo className="text-[1.25em] text-ink" /><span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </div>

          <h2
            id="reviews-heading"
            className="mt-[clamp(2rem,5vw,4rem)] max-w-[16ch] text-[clamp(2.4rem,5vw,5rem)] font-medium leading-[1] tracking-[-0.055em] text-ink"
          >
            <Words text="Partners who keep coming back" tail={<span className="text-blue">.</span>} />
          </h2>
        </div>

        <ul className="mt-[clamp(3.5rem,8vw,7rem)] grid gap-y-14 md:grid-cols-2 md:gap-x-[clamp(1.5rem,3vw,3rem)] md:gap-y-[clamp(3.5rem,6vw,5.5rem)]">
          {TESTIMONIALS.map((review) => (
            <li key={review.name} data-review className="relative pt-5">
              <Rule />
              {/* The whole review opens it on Trustpilot. On hover a blue rule
                  draws over the hairline, the title takes the accent and a
                  "Read on Trustpilot" cue slides in beside the reviewer. */}
              <a
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full outline-none"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-blue transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
                <figure className="flex h-full flex-col">
                  <div data-review-part className="flex items-center justify-between gap-4">
                    <Stars />
                    <span className="text-[0.72rem] font-semibold uppercase tabular-nums tracking-[0.14em] text-ink-mute">{review.date}</span>
                  </div>
                  <p data-review-part className="mt-[clamp(1.5rem,2.5vw,2.25rem)] text-[clamp(1.35rem,1.9vw,1.9rem)] font-medium leading-[1.15] tracking-[-0.035em] text-ink transition-colors duration-300 group-hover:text-blue group-focus-visible:text-blue">
                    {review.title}
                  </p>
                  <blockquote data-review-part className="mt-4 max-w-[60ch] text-[clamp(1rem,1.15vw,1.15rem)] leading-[1.55] tracking-[-0.01em] text-ink-mute transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink">
                    <p>“{review.quote}”</p>
                  </blockquote>
                  <figcaption data-review-part className="mt-auto flex items-end justify-between gap-4 pt-[clamp(1.5rem,2.5vw,2.25rem)] text-[0.95rem] leading-[1.4]">
                    <span>
                      <span className="block font-semibold tracking-[-0.01em] text-ink">{review.name}</span>
                      <span className="block text-ink-mute">{review.role}</span>
                    </span>
                    <span className="inline-flex -translate-x-2 items-center gap-[0.4em] whitespace-nowrap text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-blue opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                      Read on Trustpilot <span aria-hidden>↗</span>
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </figcaption>
                </figure>
              </a>
            </li>
          ))}
        </ul>

        <a
          data-reviews-cta
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-[clamp(3rem,6vw,5rem)] inline-flex items-center gap-3 rounded-full border border-[var(--bp-hairline)] px-6 py-3.5 text-[0.95rem] font-medium tracking-[-0.01em] text-ink transition-colors hover:border-blue hover:bg-blue hover:text-paper"
        >
          Read all reviews on <TrustpilotLogo className="text-[1.05em]" />
          <span aria-hidden>↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
