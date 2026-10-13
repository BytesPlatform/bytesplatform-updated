"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/animation/prefs";
import { Rule, Words } from "./reveal";
import styles from "./ClientsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Logos from bytesplatform.com (the old site's test entry is left out). */
const CLIENTS = [
  { name: "Abolaji Ayobami", href: "https://aayobami.com/", logo: "/clients/brand1.png" },
  { name: "Efatabglobal & Foundation", href: "https://efatabglobal.com/", logo: "/clients/brand2.png" },
  { name: "CAD Plus", href: "https://cadplusllc.com/", logo: "/clients/brand3.jpg" },
  { name: "5D Construction Containment Services", href: "https://5dccs.com/", logo: "/clients/brand4.png" },
  { name: "Fairpath Consultants", href: "https://www.fairpathconsultants.com/", logo: "/clients/brand5.png" },
  { name: "Oxypam", href: "https://oxypam.com/", logo: "/clients/brand6.jpg" },
  { name: "Jobco Supply", href: "https://jobcosupply.com/", logo: "/clients/brand7.png" },
  { name: "GEBI", href: "https://www.gebionline.com/", logo: "/clients/brand8.png" },
  { name: "ECS Wealth", href: "https://ecswealth.com/", logo: "/clients/brand9.jpeg" },
  { name: "Lampados Financial", href: "https://lampadosfinancial.com/", logo: "/clients/brand10.webp" },
  { name: "FeverDots", href: "https://feverdots.com/", logo: "/clients/brand11.webp" },
  { name: "On Top Home Services", href: "https://ontophomeservices.com/", logo: "/clients/brand12.jpg" },
  { name: "Keltek", href: "https://keltektool.com/", logo: "/clients/brand13.png" },
  { name: "Paradise Helicopters", href: "https://paradisecopters.com/", logo: "/clients/brand14.png" },
  { name: "Safe Travel Charters", href: "https://safetravelcharters.com/", logo: "/clients/brand15.png" },
  { name: "Regal Arms", href: "https://regal-arms.com/", logo: "/clients/brand17.png" },
  { name: "Exfoleez", href: "https://exfoleez.net/", logo: "/clients/brand18.jpg" },
  { name: "The Lab Co", href: "https://www.thelabco.net/", logo: "/clients/brand19.png" },
] as const;

const half = Math.ceil(CLIENTS.length / 2);
const ROWS = [CLIENTS.slice(0, half), CLIENTS.slice(half)];

/**
 * OUR PAST CLIENTS — two rows of logo tiles drifting in opposite directions.
 * Each row's list is rendered twice so the loop is seamless; the copy is
 * hidden from assistive tech and the keyboard.
 */
export default function ClientsSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    // Hidden states set up front and tweened *to* rest (refresh-safe), and
    // measured after Work's late pin (refreshPriority -1); see StatsSection.
    const context = gsap.context(() => {
      const ease = "expo.out";
      const trigger = (el: string, start = "top 80%") => ({ trigger: el, start, toggleActions: "play none none reverse", refreshPriority: -1 });

      gsap.set("[data-clients-head] [data-rule]", { scaleX: 0 });
      gsap.set("[data-clients-head] [data-eyebrow] > :not([data-rule])", { x: -16, opacity: 0 });
      gsap.set("[data-clients-head] [data-word]", { yPercent: 115 });
      gsap.timeline({ scrollTrigger: trigger("[data-clients-head]") })
        .to("[data-clients-head] [data-rule]", { scaleX: 1, duration: 1.4, ease: "power3.inOut" })
        .to("[data-clients-head] [data-eyebrow] > :not([data-rule])", { x: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease }, 0.2)
        .to("[data-clients-head] [data-word]", { yPercent: 0, duration: 1.2, stagger: 0.06, ease }, 0.25);

      // The rows sweep in from opposite sides (the way each one drifts), and
      // their tiles settle in one after another.
      const tiles = gsap.timeline({ scrollTrigger: trigger("[data-clients-rows]", "top 88%") });
      gsap.utils.toArray<HTMLElement>("[data-clients-row]").forEach((row, index) => {
        const items = row.querySelectorAll("li:not([aria-hidden])");
        gsap.set(row, { xPercent: index % 2 === 0 ? 12 : -12 });
        gsap.set(items, { y: 30, scale: 0.9, opacity: 0 });
        tiles
          .to(row, { xPercent: 0, duration: 1.6, ease }, index * 0.12)
          .to(items, { y: 0, scale: 1, opacity: 1, duration: 1, stagger: 0.05, ease }, index * 0.12 + 0.1);
      });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="clients-heading"
      className="pb-[clamp(5rem,14vh,10rem)] pt-[clamp(3rem,8vh,6rem)]"
    >
      <div className="mx-auto max-w-[1800px] px-[var(--bp-gut)]">
        <div data-clients-head>
          <div data-eyebrow className="relative flex items-center gap-[0.7rem] pt-4 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-mute">
            <Rule />
            <span className="hero-dot" aria-hidden />
            <span>Our past clients</span>
            <span className="ml-auto tabular-nums">{String(CLIENTS.length).padStart(2, "0")}</span>
          </div>

          <h2
            id="clients-heading"
            className="mt-[clamp(2rem,5vw,4rem)] max-w-[18ch] text-[clamp(2.4rem,5vw,5rem)] font-medium leading-[1] tracking-[-0.055em] text-ink"
          >
            <Words text="Innovators we’ve been proud to work with" tail={<span className="text-blue">.</span>} />
          </h2>
        </div>
      </div>

      <div data-clients-rows className={styles.rows}>
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} data-clients-row className={styles.row} data-reverse={rowIndex % 2 === 1 || undefined}>
            <ul className={styles.track}>
              {[0, 1].map((copy) =>
                row.map((client) => (
                  <li key={`${copy}-${client.href}`} aria-hidden={copy === 1 || undefined}>
                    <a
                      href={client.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={copy === 1 ? -1 : undefined}
                      className={styles.tile}
                      aria-label={`${client.name} (opens in a new tab)`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- small static logos */}
                      <img src={client.logo} alt="" loading="lazy" decoding="async" />
                    </a>
                  </li>
                )),
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
