import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The page panel lifts away like the home page's Work panel, uncovering the
 * fixed footer: the panel gets `data-lifted` (CSS rounds its corners) and the
 * footer shows while any of it is uncovered. Hiding waits for the corners to
 * flatten, so scrolling back up animates like scrolling down. Returns a cleanup.
 */
export function mountFooterLift(panel: HTMLElement): () => void {
  const footer = document.querySelector<HTMLElement>("[data-site-footer]");
  const stage = footer?.parentElement;
  if (!footer || !stage) return () => {};

  // onUpdate rather than onToggle: a jump straight past the whole range never toggles.
  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: "top bottom",
    end: "bottom bottom",
    onUpdate: (self) => {
      const lifted = self.progress > 0;
      if (lifted) footer.style.visibility = "visible";
      panel.toggleAttribute("data-lifted", lifted);
    },
  });

  const onCornersSettled = (event: TransitionEvent) => {
    if (event.target === panel && event.propertyName.startsWith("border") && !panel.hasAttribute("data-lifted")) {
      footer.style.visibility = "hidden";
    }
  };
  panel.addEventListener("transitionend", onCornersSettled);

  return () => {
    trigger.kill();
    panel.removeEventListener("transitionend", onCornersSettled);
    panel.removeAttribute("data-lifted");
    footer.style.visibility = "";
  };
}
