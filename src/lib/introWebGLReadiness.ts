import { isHomePath } from "@/lib/work/caseRoute";

/** One latched result per mounted intro. Subscribers survive StrictMode's
 * cleanup/remount; generation tokens prevent obsolete callbacks publishing. */
export const INTRO_WEBGL_MAX_WAIT_MS = 8000;
let generation = 0;
let status: "pending" | "ready" | "fallback" = "pending";
let stage = "renderer";
let startedAt = 0;
let finishedAt = 0;
let loaderWaiting = false;
let timedOut = false;
const listeners = new Set<() => void>();

export function introReadyLog(message: string) {
  if (process.env.NODE_ENV !== "production") console.debug(`[intro-ready] ${message}`);
}
export function resetIntroWebGLReady() {
  generation++;
  status = "pending";
  stage = "renderer";
  startedAt = performance.now();
  finishedAt = 0;
  return generation;
}
export function setIntroReadinessStage(token: number, next: string) {
  if (token === generation && status === "pending") stage = next;
}
export function markIntroWebGLReady(token: number, fallback = false) {
  if (token !== generation || status !== "pending") return;
  status = fallback ? "fallback" : "ready";
  stage = status;
  finishedAt = performance.now();
  introReadyLog(fallback ? "WebGL skipped / fallback" : "WEBGL READY");
  listeners.forEach(listener => listener());
}
export function isIntroWebGLReady() { return status === "ready"; }
export function shouldWaitForIntro(pathname: string, reduced: boolean) {
  // app/page.tsx exclusively owns IntroExperience; don't rely on streamed DOM
  // having arrived when the root-layout loader hydrates.
  return isHomePath(pathname) && !reduced;
}
export function waitForIntroWebGLReady(signal: AbortSignal): Promise<void> {
  if (status !== "pending" || signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    const done = () => {
      listeners.delete(done);
      signal.removeEventListener("abort", done);
      resolve();
    };
    listeners.add(done);
    signal.addEventListener("abort", done, { once: true });
  });
}
export function setIntroLoaderWaiting(waiting: boolean) {
  loaderWaiting = waiting;
  if (waiting) {
    timedOut = false;
    introReadyLog("loader waiting for WebGL");
  }
}
export function markIntroWebGLTimeout() {
  if (status !== "pending") return;
  timedOut = true;
  introReadyLog("WebGL timeout fallback");
}
export function introReadinessDebug() {
  return `intro loader waiting: ${loaderWaiting ? "yes" : "no"} · intro WebGL ready: ${isIntroWebGLReady() ? "yes" : "no"} · readiness stage: ${stage} · elapsed readiness time: ${Math.round((finishedAt || performance.now()) - startedAt)}ms · timeout fallback triggered: ${timedOut ? "yes" : "no"}`;
}
