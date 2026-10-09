"use client";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SiteMenu.module.css";
import { site } from "@/data/site";
import { serviceLinks } from "@/data/services";
import { productLinks } from "@/data/products";

// Plain anchors on purpose: the home page's scroll scenes are built for a fresh load.
const links = (onHome: boolean) => [
  { label: "Home", href: onHome ? "#top" : "/" },
  { label: "About", href: "/about" },
];

/** Rows that open an accordion of sub-pages instead of navigating. */
const groups = [
  { key: "services", label: "Services", base: "/services/", items: serviceLinks },
  { key: "products", label: "Products", base: "/products/", items: productLinks },
] as const;

type GroupKey = (typeof groups)[number]["key"];

const CLOSED_CLIP = "ellipse(0% 0% at 100% 0%)";
// √2 × the card's size: the smallest ellipse that just covers its far corner.
const OPEN_CLIP = "ellipse(142% 142% at 100% 0%)";

/**
 * Each letter sits in its own clipped slot with a copy just below it; on hover
 * the copies roll up one after another, so the word shuffles rather than slides.
 */
function RollText({ text }: { text: string }) {
  return (
    <span className={styles.roll}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={styles.rollLetters}>
        {Array.from(text).map((char, index) => {
          const glyph = char === " " ? " " : char;
          return (
            <span key={index} style={{ "--c": index } as React.CSSProperties}>
              <span data-char={glyph}>{glyph}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
  onOpened: () => void;
  onClosed: () => void;
};

export default function SiteMenu({ open, onClose, onOpened, onClosed }: SiteMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hasOpened = useRef(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  // The group holding the current page starts open, so that page is in view.
  const currentGroup = groups.find((group) => pathname.startsWith(group.base))?.key ?? null;
  // One group open at a time.
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(currentGroup);
  // Collapse again once the menu closes; an expanded toggle left in the nav
  // would read as an open menu to the case-study viewer's Escape handling.
  useEffect(() => {
    if (!open) setOpenGroup(currentGroup);
  }, [open, currentGroup]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || (!open && !hasOpened.current)) return;
    hasOpened.current = true;

    // HeroNav ignores toggles mid-animation, so every run starts from an end state.
    const from = open ? CLOSED_CLIP : OPEN_CLIP;
    const to = open ? OPEN_CLIP : CLOSED_CLIP;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    panel.style.visibility = "visible";
    panel.style.pointerEvents = open ? "auto" : "none";
    // The card peels open from its top-right corner as a growing ellipse.
    const animation = panel.animate(
      [{ clipPath: from }, { clipPath: to }],
      { duration: reducedMotion ? 0 : 600, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
    );

    animation.finished.then(async () => {
      // Commit the end shape before dropping the animation so no frame falls back to CSS.
      panel.style.clipPath = to;
      animation.cancel();
      if (open) {
        // Opening isn't done until the staggered links have settled too.
        await Promise.all(panel.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => undefined)));
        if (!cancelled) onOpened();
      } else {
        panel.style.visibility = "hidden";
        onClosed();
      }
    }, () => undefined);

    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [open, onOpened, onClosed]);

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        data-open={open}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={styles.panelShell}
        data-open={open}
        aria-hidden={!open}
      >
        <aside id="site-menu" className={styles.panel} aria-label="Site menu">
          <div className={styles.heading}>Navigation</div>
          <nav aria-label="Site navigation" className={styles.links}>
            {links(onHome).map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.link}
                tabIndex={open ? 0 : -1}
                style={{ "--item-index": index } as React.CSSProperties}
                onClick={onClose}
              >
                <RollText text={link.label} />
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2.343 8h11.314m0 0-4.984 4.984M13.657 8 8.673 3.016" />
                </svg>
              </a>
            ))}
            {groups.map((group, groupIndex) => {
              const expanded = openGroup === group.key;
              return (
                <Fragment key={group.key}>
                  <button
                    type="button"
                    className={styles.link}
                    aria-expanded={expanded}
                    aria-controls={`site-menu-${group.key}`}
                    tabIndex={open ? 0 : -1}
                    style={{ "--item-index": links(onHome).length + groupIndex } as React.CSSProperties}
                    onClick={() => setOpenGroup(expanded ? null : group.key)}
                  >
                    <RollText text={group.label} />
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M2.343 8h11.314m0 0-4.984 4.984M13.657 8 8.673 3.016" />
                    </svg>
                  </button>
                  <div id={`site-menu-${group.key}`} className={styles.sub} data-expanded={expanded}>
                    <div className={styles.subInner}>
                      {group.items.map((item, index) => {
                        const href = `${group.base}${item.slug}`;
                        return (
                          <a
                            key={item.slug}
                            href={href}
                            aria-current={pathname === href ? "page" : undefined}
                            tabIndex={open && expanded ? 0 : -1}
                            style={{ "--sub-index": index } as React.CSSProperties}
                            onClick={onClose}
                          >
                            {item.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </nav>

          <div className={styles.bottom}>
            <div className={styles.utilityLinks}>
              <a href={onHome ? "#services" : "/#services"} tabIndex={open ? 0 : -1}><RollText text="Process" /></a>
              <a href={site.links.careers} tabIndex={open ? 0 : -1}><RollText text="Careers" /></a>
              <a href={site.links.blog} tabIndex={open ? 0 : -1}><RollText text="Journal" /></a>
            </div>
            <div className={styles.socials}>
              <a href={site.social.instagram} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r="1" className={styles.fill} /></svg>
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 9.2V19M6.2 5.2v.1M10.6 19v-5.5a4 4 0 0 1 8 0V19M10.6 9.2V19" /></svg>
              </a>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} aria-label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 20v-7h2.5l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5H17V4.1c-.7-.1-1.4-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V10H9v3h2.3v7" /></svg>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
