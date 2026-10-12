"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import NavButton from "../ui/NavButton";
import SiteMenu from "./SiteMenu";

/**
 * Deliberately not a navbar. An identity, one action, one control — thin
 * borders, no fills, no shadows, nothing that reads as a SaaS button bar.
 *
 * Fixed above the whole page, in its own layer: it never scrolls, fades or
 * takes part in any section's animation. The bar itself lets clicks through;
 * only its children catch them.
 */
export default function HeroNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [caseHost, setCaseHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const moveHeader = (event: Event) => setCaseHost((event as CustomEvent<HTMLElement | null>).detail);
    window.addEventListener("work:case-header", moveHeader);
    return () => window.removeEventListener("work:case-header", moveHeader);
  }, []);
  // True while the menu is mid-animation; every toggle is ignored until it settles.
  const animating = useRef(false);
  const pendingNavigation = useRef<(() => void) | null>(null);

  const closeMenu = useCallback(() => {
    if (animating.current || !menuOpen) return;
    animating.current = true;
    setMenuOpen(false);
  }, [menuOpen]);

  const handleMenuOpened = useCallback(() => {
    if (pendingNavigation.current) {
      animating.current = true;
      setMenuOpen(false);
      return;
    }
    animating.current = false;
  }, []);

  const handleMenuClosed = useCallback(() => {
    animating.current = false;
    setButtonActive(false);
    const complete = pendingNavigation.current;
    pendingNavigation.current = null;
    complete?.();
  }, []);

  useEffect(() => {
    const closeForNavigation = (event: Event) => {
      const request = (event as CustomEvent<{ handled: boolean; complete: () => void }>).detail;
      request.handled = true;
      if (!menuOpen && !animating.current) {
        request.complete();
        return;
      }
      pendingNavigation.current = request.complete;
      if (menuOpen && !animating.current) {
        animating.current = true;
        setMenuOpen(false);
      }
    };
    window.addEventListener("site:close-menu-for-navigation", closeForNavigation);
    return () => window.removeEventListener("site:close-menu-for-navigation", closeForNavigation);
  }, [menuOpen]);

  const toggleMenu = () => {
    if (animating.current) return;
    if (menuOpen) {
      closeMenu();
      return;
    }
    animating.current = true;
    setButtonActive(true);
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeMenu, menuOpen]);

  const header = (
    <header data-hero-nav className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 px-[var(--bp-gut)] pt-[var(--bp-gut)] [&>*]:pointer-events-auto">
      <a
        href={onHome ? "#top" : "/"}
        aria-label="BytesPlatform — home"
        className="hero-mark text-ink transition-opacity duration-500 hover:opacity-60"
      >
        BYTES.
      </a>

      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Every CTA leads to the contact page; on that page it scrolls to the form instead of reopening it. */}
        <NavButton variant="action" href={pathname === "/contact" ? "#message" : "/contact"}>Start a project</NavButton>
        <NavButton
          variant="menu"
          className="relative z-[2]"
          expanded={menuOpen}
          active={buttonActive}
          controls="site-menu"
          onClick={toggleMenu}
        >
          {buttonActive ? "Close" : "Menu"}
        </NavButton>
        <SiteMenu
          open={menuOpen}
          onClose={closeMenu}
          onOpened={handleMenuOpened}
          onClosed={handleMenuClosed}
        />
      </div>
    </header>
  );
  return caseHost ? createPortal(header, caseHost) : header;
}
