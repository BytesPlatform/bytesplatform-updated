import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type DiveOptions = {
  /** section the dive leaves (its sticky stage holds through the dive) */
  section: HTMLElement;
  /** everything that dives together, each rotated/scaled about the pill */
  layers: HTMLElement[];
  /** the pill that acts as the point the camera flies into */
  pill: HTMLElement;
  /** fixed full-screen layer carrying the title over the blue */
  overlay: HTMLElement;
  /** the section revealed on the other side */
  next: HTMLElement;
  /** page offset into `section` where the dive starts */
  startOffset: () => number;
  /** scroll distance of the flight into the pill */
  zoomLength: () => number;
  /** scroll distance the title holds on the blue */
  titleLength: () => number;
  /** freeze/thaw measurements that transforms would corrupt */
  freeze: () => void;
  thaw: () => void;
  /** state of the shared-canvas blue and whether Work renders beneath it */
  setLoaderState?: (progress: number, active: boolean, direction: "forward" | "backward", holdWork: boolean) => void;
};

/** The reference makes a restrained turn before the pill fills the frame. */
const ROTATION = 8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeIn = (t: number) => t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInCubic = (t: number) => t ** 3;

/** Layout offset of `el` inside `ancestor`, ignoring transforms. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    // Sticky/positioned ancestors outside `ancestor` end the walk.
    if (parent && !ancestor.contains(parent) && parent !== ancestor) break;
    node = parent;
  }
  return { x, y };
}

/**
 * A scroll-scrubbed transition from one section into the next. Every frame is
 * a pure function of the scroll position, so it plays forwards, backwards or
 * at any speed without locking the page or jumping it:
 *
 * 1. zoom   — the pill's label and arrow leave, and the section (still pinned)
 *             turns and zooms into the pill until its blue fills the screen;
 * 2. title  — the title rises in on the blue, holds, and leaves;
 * 3. reveal — the next section rises from below. The blue's lower edge is
 *             locked to its top edge, so the blue slides off with the page.
 */
export function createDiveScene(opts: DiveOptions) {
  const label = () => opts.pill.querySelector<HTMLElement>(".action-pill__label");
  const icon = () => opts.pill.querySelector<HTMLElement>(".action-pill__icon");
  const titleWords = Array.from(opts.overlay.querySelectorAll<HTMLElement>("[data-dive-title-word]"));
  const pillLayer = opts.layers.find(layer => layer.contains(opts.pill)) ?? opts.layers[opts.layers.length - 1];

  // Zoom is exponential so the flight reads as constant speed, not a lurch.
  let scale = 4;
  /** The pill's centre on screen while the stage is pinned, and in the stage. */
  let pillScreen = { x: 0, y: 0 };
  let pillInStage = { x: 0, y: 0 };
  /** Each other layer's untransformed page position. They keep scrolling with
   *  the page through the dive (the shared canvas layer is the tall intro
   *  container), so their zoom origin is re-aimed at the pill every frame. */
  const layerPage = new Map<HTMLElement, { left: number; top: number }>();
  let frozen = false;
  let lastKey = "";

  /** Measure untransformed: the pill inside the pinned stage, and every layer
   *  on the page. Size the zoom so the pill's blue covers the screen. */
  const aim = () => {
    const saved = opts.layers.map(layer => layer.style.transform);
    opts.layers.forEach(layer => { layer.style.transform = ""; });
    const at = offsetWithin(opts.pill, pillLayer);
    pillInStage = { x: at.x + opts.pill.offsetWidth / 2, y: at.y + opts.pill.offsetHeight / 2 };
    // The stage is sticky at the viewport's top while the dive runs.
    const stageLeft = pillLayer.getBoundingClientRect().left;
    pillScreen = { x: stageLeft + pillInStage.x, y: pillInStage.y };
    opts.layers.forEach(layer => {
      if (layer === pillLayer) return;
      const r = layer.getBoundingClientRect();
      layerPage.set(layer, { left: r.left + window.scrollX, top: r.top + window.scrollY });
    });
    opts.layers.forEach((layer, i) => { layer.style.transform = saved[i]; });
    const w = window.innerWidth;
    const h = window.innerHeight;
    const { x, y } = pillScreen;
    const reach = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y));
    scale = Math.max(4, (reach * 1.15) / Math.max(1, opts.pill.offsetHeight / 2));
  };

  /** Where the pill sits in `layer`'s own box at the current scroll. */
  const originIn = (layer: HTMLElement) => {
    if (layer === pillLayer) return pillInStage;
    const page = layerPage.get(layer);
    if (!page) return pillScreen;
    return { x: pillScreen.x - (page.left - window.scrollX), y: pillScreen.y - (page.top - window.scrollY) };
  };

  const transformLayer = (layer: HTMLElement, v: number) => {
    if (v <= 0) {
      layer.style.transform = "";
      layer.style.transformOrigin = "";
      layer.style.filter = "";
      return;
    }
    const origin = originIn(layer);
    layer.style.transformOrigin = `${origin.x}px ${origin.y}px`;
    layer.style.transform = `rotate(${ROTATION * v}deg) scale(${Math.pow(scale, v)})`;
    // Keep the expanding pill crisp while its canvas world falls softly out
    // of focus, as in the reference takeover.
    layer.style.filter = layer === pillLayer ? "" : `blur(${v * 7}px)`;
  };

  const setPart = (el: HTMLElement, t: number, x: number) => {
    el.style.opacity = t > 0 ? String(1 - t) : "";
    el.style.transform = t > 0 ? `translateX(${x}px)` : "";
  };

  const startTop = () => opts.section.getBoundingClientRect().top + window.scrollY + opts.startOffset();
  const nextTop = () => opts.next.getBoundingClientRect().top + window.scrollY;

  function render() {
    const h = Math.max(1, window.innerHeight);
    const y = window.scrollY;
    const start = startTop();
    const zoomLength = Math.max(1, opts.zoomLength());
    const titleLength = Math.max(1, opts.titleLength());
    const into = y - start;
    const zoomT = clamp01(into / zoomLength);
    const titleT = clamp01((into - zoomLength) / titleLength);
    const landed = y >= nextTop() - 1;

    // 1. Zoom. Past it the canvas is fully blue: every layer drops its
    //    transform and the stage steps aside (scaled, its own clip would
    //    cover the screen) while the blue carries the rest.
    const zoom = zoomT < 1 ? easeIn(zoomT) : 0;
    // Measurements are frozen while the canvas layer is transformed; freeze
    // before the first transform so the snapshot is untransformed.
    const wantFrozen = zoom > 0;
    if (wantFrozen !== frozen) {
      frozen = wantFrozen;
      if (frozen) {
        opts.layers.forEach(layer => transformLayer(layer, 0));
        opts.freeze();
      } else opts.thaw();
    }
    opts.layers.forEach(layer => transformLayer(layer, zoom));
    pillLayer.style.visibility = zoomT >= 1 && !landed ? "hidden" : "";

    const diving = zoomT > 0 && !landed;
    opts.pill.classList.toggle("is-diving", diving);
    const labelT = clamp01(zoomT / 0.3);
    const iconT = clamp01(zoomT / 0.45);
    const text = label();
    const circle = icon();
    // Written directly, not through gsap.set: while the site loader holds
    // GSAP's timeline a set would be queued instead of applied.
    if (text) setPart(text, labelT, -10 * easeIn(labelT));
    if (circle) setPart(circle, iconT, opts.pill.offsetWidth * easeInCubic(iconT));

    // 2. Title over the blue: in, hold, out.
    const showTitle = titleT > 0 && titleT < 1;
    opts.overlay.style.visibility = showTitle ? "visible" : "hidden";
    opts.overlay.style.opacity = showTitle ? "1" : "0";
    titleWords.forEach((word, i) => {
      const inT = easeOut(clamp01((titleT - i * 0.1) / 0.4));
      const outT = easeInCubic(clamp01((titleT - 0.65 - i * 0.07) / 0.28));
      word.style.opacity = String(inT * (1 - outT));
      word.style.transform = `translateY(${115 * (1 - inT) - 115 * outT}%)`;
    });

    // 3. Reveal: the canvas blue covers everything above the next section's
    //    top edge, and Work renders beneath it until it takes the stage.
    const blue = zoomT >= 1 ? clamp01((nextTop() - y) / h) : 0;
    const active = zoomT > 0 && !landed;
    const holdWork = active && zoomT >= 1 && blue < 1;
    opts.next.style.visibility = active && blue >= 1 ? "hidden" : "";
    // Only report changes: the receiver redraws from these every frame anyway.
    const key = `${blue.toFixed(4)}|${active}|${holdWork}`;
    if (key !== lastKey) {
      lastKey = key;
      opts.setLoaderState?.(blue, active, "forward", holdWork);
    }
  }

  const trigger = ScrollTrigger.create({
    start: () => startTop() - 1,
    end: () => nextTop() + 1,
    onUpdate: render,
    onRefresh: () => { aim(); render(); },
    // Leaving the band either way must land on its exact end state.
    onLeave: render,
    onLeaveBack: render,
  });
  aim();
  render();

  return {
    kill() {
      trigger.kill();
      opts.layers.forEach(layer => transformLayer(layer, 0));
      pillLayer.style.visibility = "";
      if (frozen) opts.thaw();
      frozen = false;
      opts.pill.classList.remove("is-diving", "is-diving-instant");
      const text = label();
      const circle = icon();
      if (text) setPart(text, 0, 0);
      if (circle) setPart(circle, 0, 0);
      titleWords.forEach(word => { word.style.opacity = ""; word.style.transform = ""; });
      opts.overlay.style.visibility = "";
      opts.overlay.style.opacity = "";
      opts.next.style.visibility = "";
      opts.setLoaderState?.(0, false, "forward", false);
    },
  };
}
