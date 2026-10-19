"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { usePathname } from "next/navigation";

const normalize = (path: string) => path.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";

/** The page this link points to is the one being viewed. */
export function useIsCurrentPage(href: string) {
  return normalize(usePathname()) === normalize(href);
}

/** The link's section (e.g. /blogs for a post) contains the page being viewed. */
export function useIsCurrentSection(href: string) {
  const path = normalize(usePathname());
  const base = normalize(href);
  return base !== "/" && path.startsWith(`${base}/`);
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode };

/**
 * A link that refuses to reopen the page you're on: on the current page it
 * renders as plain text marked aria-current="page", so it can be styled as
 * active but can't be clicked, tabbed to or opened in a new tab.
 */
export default function CurrentLink({ href, children, className, style, onClick, tabIndex, ...rest }: Props) {
  const current = useIsCurrentPage(href);
  const inSection = useIsCurrentSection(href);
  // Section anchors must remain clickable even on the current page.
  if (current && !href.includes("#")) {
    return <span aria-current="page" className={className} style={style}>{children}</span>;
  }
  return (
    <a href={href} className={className} style={style} onClick={onClick} tabIndex={tabIndex} aria-current={inSection ? "true" : undefined} {...rest}>
      {children}
    </a>
  );
}
