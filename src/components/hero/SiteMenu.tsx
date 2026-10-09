"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SiteMenu.module.css";
import { site } from "@/data/site";
import { serviceLinks } from "@/data/services";
import { productLinks } from "@/data/products";
import CurrentLink from "@/components/ui/CurrentLink";

// Plain anchors on purpose: the home page's scroll scenes are built for a fresh load.
// Each row renders through CurrentLink, so the page being viewed shows as active text.
const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

/** Plain rows listed after the groups. */
const trailingLinks = [
  { label: "Industries", href: "/industries" },
  { label: "E-Invoicing", href: "/e-invoicing" },
  { label: "Contact Us", href: "/contact" }
];

/** Rows that slide in a sub-list of pages instead of navigating. */
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
  // The group holding the current page; its row carries the section dot.
  const currentGroup = groups.find((group) => pathname.startsWith(group.base))?.key ?? null;
  // The sub-list on screen, if any. The menu always opens on the main list.
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  // Back to the main list once the menu closes; an expanded toggle left in the nav
  // would read as an open menu to the case-study viewer's Escape handling.
  useEffect(() => {
    if (!open) setOpenGroup(null);
  }, [open]);

  // Keyboard focus follows the slide: into the sub-list's back button, and back
  // to the group row it came from.
  const groupButtons = useRef<Partial<Record<GroupKey, HTMLButtonElement | null>>>({});
  const backButtons = useRef<Partial<Record<GroupKey, HTMLButtonElement | null>>>({});
  const openSub = (key: GroupKey) => {
    setOpenGroup(key);
    requestAnimationFrame(() => backButtons.current[key]?.focus({ preventScroll: true }));
  };
  const closeSub = () => {
    const from = openGroup;
    setOpenGroup(null);
    if (from) requestAnimationFrame(() => groupButtons.current[from]?.focus({ preventScroll: true }));
  };

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
          {/* Two layers in one frame: the main list, and a sub-list per group parked
              off to the right. Opening a group slides the main list halfway out to the
              left while the sub-list slides in over a longer duration, for a parallax feel. */}
          <div className={styles.views} data-group={openGroup ?? undefined}>
            <div className={styles.mainView} inert={openGroup !== null}>
              <div className={styles.heading}>Navigation</div>
              <nav aria-label="Site navigation" className={styles.links}>
                {links.map((link, index) => (
                  <CurrentLink
                    key={link.href}
                    href={link.href}
                    className={styles.link}
                    tabIndex={open ? 0 : -1}
                    style={{ "--item-index": index } as React.CSSProperties}
                    onClick={onClose}
                  >
                    <RollText text={link.label} />
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M3.2 12.8 12.8 3.2m0 0H5.4m7.4 0v7.4" />
                    </svg>
                  </CurrentLink>
                ))}
                {groups.map((group, groupIndex) => (
                  <button
                    key={group.key}
                    ref={(node) => { groupButtons.current[group.key] = node; }}
                    type="button"
                    className={`${styles.link} ${styles.groupLink}`}
                    data-section-current={currentGroup === group.key || undefined}
                    aria-expanded={openGroup === group.key}
                    aria-controls={`site-menu-${group.key}`}
                    tabIndex={open ? 0 : -1}
                    style={{ "--item-index": links.length + groupIndex } as React.CSSProperties}
                    onClick={() => openSub(group.key)}
                  >
                    <RollText text={group.label} />
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M2.343 8h11.314m0 0-4.984 4.984M13.657 8 8.673 3.016" />
                    </svg>
                  </button>
                ))}
                {trailingLinks.map((link, index) => (
                  <CurrentLink
                    key={link.label}
                    href={link.href}
                    className={styles.link}
                    tabIndex={open ? 0 : -1}
                    style={{ "--item-index": links.length + groups.length + index } as React.CSSProperties}
                    onClick={onClose}
                  >
                    <RollText text={link.label} />
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M3.2 12.8 12.8 3.2m0 0H5.4m7.4 0v7.4" />
                    </svg>
                  </CurrentLink>
                ))}
              </nav>
            </div>

            {groups.map((group) => {
              const active = openGroup === group.key;
              return (
                <div
                  key={group.key}
                  id={`site-menu-${group.key}`}
                  className={styles.subView}
                  data-active={active}
                  inert={!active}
                >
                  <button
                    ref={(node) => { backButtons.current[group.key] = node; }}
                    type="button"
                    className={`${styles.heading} ${styles.back}`}
                    tabIndex={open && active ? 0 : -1}
                    onClick={closeSub}
                  >
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M13.657 8H2.343m0 0 4.984 4.984M2.343 8l4.984-4.984" />
                    </svg>
                    {group.label}
                  </button>
                  <nav aria-label={group.label} className={styles.links}>
                    {group.items.map((item, index) => (
                      <CurrentLink
                        key={item.slug}
                        href={`${group.base}${item.slug}`}
                        className={`${styles.link} ${styles.subLink}`}
                        tabIndex={open && active ? 0 : -1}
                        style={{ "--sub-index": index } as React.CSSProperties}
                        onClick={onClose}
                      >
                        <RollText text={item.label} />
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M3.2 12.8 12.8 3.2m0 0H5.4m7.4 0v7.4" />
                        </svg>
                      </CurrentLink>
                    ))}
                  </nav>
                </div>
              );
            })}
          </div>

          <div className={styles.bottom}>
            <div className={styles.utilityLinks}>
              <CurrentLink href={site.links.careers} tabIndex={open ? 0 : -1}><RollText text="Careers" /></CurrentLink>
              <CurrentLink href={site.links.blog} tabIndex={open ? 0 : -1}><RollText text="Blogs" /></CurrentLink>
              {/* <a href={site.links.careers} tabIndex={open ? 0 : -1}><RollText text="Contact Us" /></a> */}
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
