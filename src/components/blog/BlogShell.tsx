"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroNav from "@/components/hero/HeroNav";
import SiteFooter from "@/components/sections/SiteFooter";
import { fontsReady, isCoarsePointer, prefersReducedMotion } from "@/lib/animation/prefs";
import { mountScroll } from "@/lib/animation/scroll";
import { mountFooterLift } from "@/lib/animation/footerLift";
import styles from "./Blog.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The page frame shared by the blog index and posts: fixed nav, smooth
 * scroll, the footer lift, and the site's heading and fade-up reveals.
 */
export default function BlogShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => mountScroll({ smooth: !prefersReducedMotion() && !isCoarsePointer() }), []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const releaseFooter = mountFooterLift(el);

    const context = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.timeline({ delay: 0.1 })
        .from("[data-hero-title] [data-word]", { yPercent: 115, duration: 1.3, stagger: 0.06, ease: "expo.out" })
        .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: "expo.out" }, 0.3);
    }, el);

    let cancelled = false;
    void fontsReady().then(() => { if (!cancelled) ScrollTrigger.refresh(); });

    return () => {
      cancelled = true;
      context.revert();
      releaseFooter();
    };
  }, []);

  return (
    <>
      <div ref={root} className={styles.page}>
        <HeroNav />
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
