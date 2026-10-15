import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScrollAutoplay } from "@/lib/animation/autoplay";

gsap.registerPlugin(ScrollTrigger);

/**
 * How far the page moves with the video, as a fraction of the viewport; set per
 * breakpoint on the section (--fluid-travel) next to the layout it frames.
 */
export const travelFraction = (section: HTMLElement) =>
  parseFloat(getComputedStyle(section).getPropertyValue("--fluid-travel")) || 0.32;

/** Inverse of GSAP's "sine.inOut": the time at which the eased value is `v`. */
const sineInOutInverse = (v: number) => Math.acos(1 - 2 * Math.min(1, Math.max(0, v))) / Math.PI;

/**
 * A scroll-scrubbed transition that carries itself: the reel's morph follows
 * the page through the section's travel band, forwards and backwards, and once
 * the reader moves into the band the page keeps going on its own to the far
 * end (see createScrollAutoplay), at the morph's own pace. Nothing locks the
 * page, so momentum or a change of direction can never fight it.
 *
 * The timeline eases its morph with sine.inOut. It used to play on its own
 * while the page was carried along on the same ease, which kept the morph
 * equal to the page's progress through the band. Scrubbing to the
 * inverse-eased time keeps exactly that pairing: each scroll position shows
 * the same frame it always did.
 */
export function createAutoScrollScene(section: HTMLElement, timeline: gsap.core.Timeline) {
  const start = () => section.getBoundingClientRect().top + window.scrollY;
  const end = () => start() + window.innerHeight * travelFraction(section);
  const sync = (progress: number) => timeline.progress(sineInOutInverse(progress));
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * travelFraction(section)}`,
    invalidateOnRefresh: true,
    onUpdate: self => sync(self.progress),
    onRefresh: self => sync(self.progress),
  });
  sync(trigger.progress);
  const autoplay = createScrollAutoplay({ start, end, seconds: timeline.duration() });
  return {
    trigger,
    kill() {
      autoplay.kill();
      trigger.kill();
    },
  };
}
