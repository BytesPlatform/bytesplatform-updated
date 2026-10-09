"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroNav from "@/components/hero/HeroNav";
import ActionPill from "@/components/ui/ActionPill";
import SiteFooter from "@/components/sections/SiteFooter";
import { serviceLinks } from "@/data/services";
import type { ServiceContent } from "@/data/serviceContent";
import { fontsReady, isCoarsePointer, prefersReducedMotion } from "@/lib/animation/prefs";
import { mountScroll } from "@/lib/animation/scroll";
import styles from "./ServicePage.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Each word rides up out of its own clipped slot; `tail` rides with the last one. */
function Words({ text, tail }: { text: string; tail?: ReactNode }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span className={styles.wordSlot}>
            <span data-word className={styles.word}>{word}{index === words.length - 1 && tail}</span>
          </span>
        </Fragment>
      ))}
    </>
  );
}

const period = <span className="hero-period">.</span>;

export default function ServicePage({ content }: { content: ServiceContent }) {
  const root = useRef<HTMLDivElement>(null);
  const others = serviceLinks.filter((service) => service.slug !== content.slug);

  useEffect(() => mountScroll({ smooth: !prefersReducedMotion() && !isCoarsePointer() }), []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    const stage = footer?.parentElement;

    const context = gsap.context(() => {
      // The page lifts away like the home page's Work panel, uncovering the fixed footer.
      // onUpdate rather than onToggle: a jump straight past the whole range never toggles.
      if (footer && stage) {
        ScrollTrigger.create({
          trigger: stage,
          start: "top bottom",
          end: "bottom bottom",
          onUpdate: (self) => {
            const lifted = self.progress > 0;
            if (lifted) footer.style.visibility = "visible";
            el.toggleAttribute("data-lifted", lifted);
          },
        });
      }
      if (reduced) return;

      gsap.timeline({ delay: 0.1 })
        .from("[data-hero-title] [data-word]", { yPercent: 115, duration: 1.3, stagger: 0.08, ease: "expo.out" })
        .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: "expo.out" }, 0.35);

      gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((heading) => {
        gsap.from(heading.querySelectorAll("[data-word]"), {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: heading, start: "top 86%", once: true },
        });
      });

      gsap.set("[data-reveal]", { opacity: 0 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (batch) => gsap.fromTo(batch, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true }),
      });

      // The statement inks in word by word as it crosses the viewport.
      gsap.fromTo("[data-statement] [data-word]", { opacity: 0.14 }, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: "[data-statement]", start: "top 78%", end: "bottom 45%", scrub: true },
      });

      // The process rail draws down as the steps pass.
      gsap.from("[data-rail]", {
        scaleY: 0,
        ease: "none",
        scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: true },
      });
    }, el);

    // Hiding waits for the corners to flatten, so the way back animates like the way in.
    const onCornersSettled = (event: TransitionEvent) => {
      if (event.target === el && event.propertyName.startsWith("border") && !el.hasAttribute("data-lifted") && footer) {
        footer.style.visibility = "hidden";
      }
    };
    el.addEventListener("transitionend", onCornersSettled);

    // Late webfonts change line breaks, and with them every trigger position.
    let cancelled = false;
    void fontsReady().then(() => { if (!cancelled) ScrollTrigger.refresh(); });

    return () => {
      cancelled = true;
      el.removeEventListener("transitionend", onCornersSettled);
      context.revert();
      el.removeAttribute("data-lifted");
      if (footer) footer.style.visibility = "";
    };
  }, []);

  const { hero, statement, offer, highlights, process, stack, faqs, cta } = content;

  return (
    <>
      <div ref={root} className={styles.page}>
        <HeroNav />

        {/* ------------------------------------------------------------ hero */}
        <section id="top" className={styles.hero}>
          <h1 data-hero-title className={styles.heroTitle}>
            {hero.title.map((line, index) => (
              <Fragment key={line}>
                {index > 0 && <br />}
                <Words text={line} tail={index === hero.title.length - 1 ? period : undefined} />
              </Fragment>
            ))}
          </h1>
          <div className={styles.heroFoot}>
            <p data-hero-fade className={styles.heroIntro}>{hero.intro}</p>
            <div data-hero-fade>
              <ActionPill href="#contact" label="Start your project" />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- statement */}
        <section className={styles.section}>
          <p data-statement className={styles.statement}>
            {statement.split(" ").map((word, index) => (
              <span key={index}><span data-word>{word}</span>{" "}</span>
            ))}
          </p>
        </section>

        {/* ----------------------------------------------------------- offer */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 data-lines className={styles.h2}><Words text={offer.heading} /></h2>
            {offer.body && <p data-reveal className={styles.body}>{offer.body}</p>}
          </div>
          <ul className={styles.rows}>
            {offer.items.map((item) => (
              <li data-reveal key={item.title} className={styles.row}>
                <h3 className={styles.rowTitle}>{item.title}</h3>
                <div className={styles.rowText}>
                  <p>{item.body}</p>
                  {item.tags && (
                    <ul className={styles.tags}>
                      {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------------ highlights */}
        {highlights && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 data-lines className={styles.h2}><Words text={highlights.heading} /></h2>
              {highlights.body && <p data-reveal className={styles.body}>{highlights.body}</p>}
            </div>
            <div className={styles.cards}>
              {highlights.items.map((item, index) => (
                <article data-reveal key={item.title} className={`${styles.card} ${index === 0 ? styles.cardAccent : ""}`}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardBody}>{item.body}</p>
                  {item.points && (
                    <ul className={styles.cardPoints}>
                      {item.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- process */}
        {process && (
          <section className={`${styles.section} ${styles.split}`}>
            <div className={styles.splitAside}>
              <h2 data-lines className={styles.h2}><Words text={process.heading} /></h2>
              {process.body && <p data-reveal className={styles.body}>{process.body}</p>}
            </div>
            <ol data-steps className={styles.steps}>
              <span data-rail aria-hidden className={styles.rail} />
              {process.steps.map((step) => (
                <li data-reveal key={step.title} className={styles.step}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ----------------------------------------------------------- stack */}
        {stack && (
          <div className={styles.marquee} aria-label={`${stack.label}: ${stack.items.join(", ")}`}>
            <div className={styles.marqueeTrack} aria-hidden>
              {[0, 1].map((copy) => (
                <span key={copy} className={styles.marqueeRun}>
                  {stack.items.map((item) => (
                    <span key={item} className={styles.marqueeItem}>{item}<span className={styles.marqueeDot} /></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- faq */}
        <section className={`${styles.section} ${styles.split}`}>
          <div className={styles.splitAside}>
            <h2 data-lines className={styles.h2}><Words text="You ask. We answer." /></h2>
          </div>
          <div className={styles.faqs}>
            {faqs.map((faq) => (
              <details data-reveal key={faq.q} className={styles.faq}>
                <summary>
                  {faq.q}
                  <span aria-hidden className={styles.faqIcon} />
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- cta */}
        <section className={styles.cta}>
          <h2 data-lines className={styles.ctaTitle}>
            <Words text={cta.heading} tail={<span className="hero-period">?</span>} />
          </h2>
          <p data-reveal className={styles.body}>{cta.body}</p>
          <div data-reveal>
            <ActionPill href="#contact" label="Start your project" />
          </div>
          <nav data-reveal aria-label="Other services" className={styles.others}>
            {others.map((service) => (
              <a key={service.slug} href={`/services/${service.slug}`} className="hero-pill">
                <span className="hero-dot" aria-hidden />
                {service.label}
              </a>
            ))}
          </nav>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
