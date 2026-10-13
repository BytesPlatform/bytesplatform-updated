import gsap from "gsap";
import { createCardCursor } from "@/lib/work/cardCursor";

/** Reuse Work's liquid circle-and-arrow cursor on the real service links. */
export function createServiceCardInteraction(section: HTMLElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cursor = createCardCursor(reducedMotion);
  const cards = Array.from(section.querySelectorAll<HTMLAnchorElement>(".service-orbit-card"));
  let active: HTMLAnchorElement | null = null;
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;

  function reset(card: HTMLAnchorElement) {
    card.style.cursor = "";
    const surface = card.querySelector<HTMLElement>(".service-orbit-card__surface");
    if (surface) gsap.to(surface, { "--hover-x": "0deg", "--hover-y": "0deg", "--hover-glow": 0, duration: reducedMotion.matches ? 0 : .25, overwrite: true });
  }
  function hide() {
    if (active) reset(active);
    active = null;
    cursor.hide();
  }
  function update(card: HTMLAnchorElement, x: number, y: number) {
    if (active !== card) {
      if (active) reset(active);
      active = card;
      card.style.cursor = "none";
      cursor.move(x, y);
      cursor.show(true);
    } else cursor.move(x, y);
    const rect = card.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (y - rect.top) / rect.height));
    const surface = card.querySelector<HTMLElement>(".service-orbit-card__surface");
    if (surface) gsap.to(surface, {
      "--hover-x": `${reducedMotion.matches ? 0 : (.5 - py) * 7}deg`,
      "--hover-y": `${reducedMotion.matches ? 0 : (px - .5) * 9}deg`,
      "--hover-glow": 1, duration: reducedMotion.matches ? 0 : .25, overwrite: true, ease: "power2.out",
    });
  }
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") { pointer = null; hide(); return; }
    pointer = { x: event.clientX, y: event.clientY };
    const card = (event.target as Element).closest<HTMLAnchorElement>(".service-orbit-card");
    if (card && section.contains(card)) update(card, pointer.x, pointer.y);
    else hide();
  };
  // Recheck the card under a stationary pointer while the ring rotates.
  const scroll = () => {
    if (frame || !pointer) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pointer) return;
      const card = document.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLAnchorElement>(".service-orbit-card");
      if (card && section.contains(card)) update(card, pointer.x, pointer.y);
      else hide();
    });
  };
  const leave = () => { pointer = null; hide(); };
  const visibility = () => { if (document.hidden) leave(); };
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("blur", leave);
  window.addEventListener("scroll", scroll, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("blur", leave);
    window.removeEventListener("scroll", scroll);
    cards.forEach(card => {
      card.style.cursor = "";
      const surface = card.querySelector<HTMLElement>(".service-orbit-card__surface");
      if (surface) { gsap.killTweensOf(surface); surface.style.removeProperty("--hover-x"); surface.style.removeProperty("--hover-y"); surface.style.removeProperty("--hover-glow"); }
    });
    cursor.dispose();
  };
}
