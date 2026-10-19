/** Real production renders (the visible fluid pass on the shared canvas,
 * still covered by the HTML video) required before the handoff. */
export const REQUIRED_REAL_FLUID_FRAMES = 5;
/** Distinct decoded media frames those renders must have consumed. */
export const REQUIRED_DISTINCT_MEDIA_FRAMES = 3;
const MEDIA_EPSILON = 0.0001;

/** Pure warm-up bookkeeping, no GPU facts. A media frame only counts once a
 * real render has drawn it, so an advancing clock alone, or renders of one
 * still frame alone, never pass. Readiness latches until reset(). */
export function createFluidWarmup() {
  const state = {
    decodedFrames: 0, mediaTime: -1,
    renders: 0, renderedFrames: 0, renderedMediaTime: -1, ready: false,
  };
  return {
    state,
    reset() {
      Object.assign(state, { decodedFrames: 0, mediaTime: -1, renders: 0, renderedFrames: 0, renderedMediaTime: -1, ready: false });
    },
    /** A decoded frame's media time; false when it isn't a new frame. A loop
     * or seek jumps backwards, which is a new frame too. */
    decoded(time: number) {
      if (!Number.isFinite(time) || time < 0 || Math.abs(time - state.mediaTime) <= MEDIA_EPSILON) return false;
      state.mediaTime = time;
      state.decodedFrames++;
      return true;
    },
    /** The real fluid pass just drew; false when it can't count (already
     * ready, or no decoded frame to have drawn yet). */
    rendered() {
      if (state.ready || state.decodedFrames === 0) return false;
      state.renders++;
      if (Math.abs(state.mediaTime - state.renderedMediaTime) > MEDIA_EPSILON) {
        state.renderedMediaTime = state.mediaTime;
        state.renderedFrames++;
      }
      state.ready = state.renders >= REQUIRED_REAL_FLUID_FRAMES && state.renderedFrames >= REQUIRED_DISTINCT_MEDIA_FRAMES;
      return true;
    },
  };
}

type WatchOptions = {
  /** a new decoded frame arrived; `first` once per warm-up */
  frame?(first: boolean): void;
  /** an interaction/visibility wake while warming */
  wake?(): void;
  changed(ready: boolean): void;
};

/** Media-side facts only: has the HTML video produced real, advancing
 * frames? The shared ticker does the rendering and reports each real pass
 * through rendered(); there is no loop of its own. A hidden document pauses
 * frame callbacks; suspend() (context loss) resets the warm-up. */
export function watchVideoFrame(video: HTMLVideoElement, opts: WatchOptions) {
  const warmup = createFluidWarmup();
  let active = false;
  let callback: number | null = null;
  let listening = false;
  let lastPlay = -Infinity;
  let playPending = false;
  let lastFrameCallback = 0;
  let lastDecodedLog = -Infinity;
  let lastRenderAt = -Infinity;
  let lastStallLog = -Infinity;
  let presentedFrames = -1;
  let lastWakeReason = 'initial';
  const supportsFrames = typeof video.requestVideoFrameCallback === 'function';
  const usable = () => video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !video.seeking;
  const warming = () => active && !warmup.state.ready;
  const cancel = () => {
    if (callback !== null) video.cancelVideoFrameCallback(callback);
    callback = null;
  };
  const recoverPlay = () => {
    const now = performance.now();
    if (!document.hidden && video.muted && video.playsInline && (video.paused || video.ended) && video.readyState >= 1 && !playPending && now - lastPlay >= 1000) {
      lastPlay = now;
      playPending = true;
      void video.play().catch(() => {}).finally(() => { playPending = false; });
    }
  };
  const decoded = (time: number) => {
    if (!warmup.decoded(time)) return;
    const { decodedFrames } = warmup.state;
    const now = performance.now();
    if (decodedFrames <= REQUIRED_DISTINCT_MEDIA_FRAMES || now - lastDecodedLog >= 250) {
      lastDecodedLog = now;
      fluidVideoLog(video, `decoded media frame ${decodedFrames} time=${time.toFixed(3)}`);
    }
    if (now - lastRenderAt >= 1000 && now - lastStallLog >= 1000) {
      lastStallLog = now;
      fluidVideoLog(video, 'decoded video advancing, waiting for a real fluid render');
    }
    opts.frame?.(decodedFrames === 1);
  };
  const requestFrame = () => {
    if (!warming() || document.hidden || callback !== null || !supportsFrames) return;
    callback = video.requestVideoFrameCallback((_now, metadata) => {
      callback = null;
      lastFrameCallback = performance.now();
      if (usable() && metadata.presentedFrames !== presentedFrames) {
        presentedFrames = metadata.presentedFrames;
        decoded(metadata.mediaTime);
      }
      requestFrame();
    });
  };
  const wake = (event?: Event) => {
    if (!warming()) return;
    lastWakeReason = event?.type ?? 'initial';
    if (document.hidden) { cancel(); return; }
    recoverPlay();
    requestFrame();
    opts.wake?.();
  };
  const listen = (enabled: boolean) => {
    if (listening === enabled) return;
    listening = enabled;
    for (const event of ['pointerdown', 'touchstart', 'scroll']) {
      if (enabled) window.addEventListener(event, wake, { passive: true });
      else window.removeEventListener(event, wake);
    }
    if (enabled) document.addEventListener('visibilitychange', wake);
    else document.removeEventListener('visibilitychange', wake);
  };
  const stop = () => {
    cancel();
    listen(false);
  };
  return {
    get ready() { return warmup.state.ready; },
    restart() {
      cancel();
      warmup.reset();
      presentedFrames = -1;
      lastFrameCallback = performance.now();
      lastRenderAt = performance.now();
      active = true;
      opts.changed(false);
      listen(true);
      wake();
    },
    /** Call after each real production fluid.render() on a live context. */
    rendered() {
      if (!warming()) return;
      recoverPlay();
      const now = performance.now();
      lastRenderAt = now;
      // Without (or with stalled) frame callbacks, the media clock stands in.
      if (usable() && (!supportsFrames || now - lastFrameCallback >= 500)) decoded(video.currentTime);
      if (!warmup.rendered()) return;
      const { renders, renderedFrames, ready } = warmup.state;
      if (renders <= REQUIRED_REAL_FLUID_FRAMES) fluidVideoLog(video, `real fluid render warmup ${renders}/${REQUIRED_REAL_FLUID_FRAMES} (media frames ${renderedFrames}/${REQUIRED_DISTINCT_MEDIA_FRAMES})`);
      if (ready) {
        stop();
        fluidVideoLog(video, 'REAL PRODUCTION WEBGL READY');
        opts.changed(true);
      }
    },
    suspend() {
      active = false;
      stop();
      warmup.reset();
      opts.changed(false);
    },
    debug() {
      const s = warmup.state;
      return `decoded frame ready: ${s.decodedFrames > 0 ? 'yes' : 'no'} · media frames seen: ${s.decodedFrames} · last mediaTime: ${s.mediaTime.toFixed(3)} · real fluid warmup renders: ${s.renders} (${s.renderedFrames} media frames) · required warmup renders: ${REQUIRED_REAL_FLUID_FRAMES} (${REQUIRED_DISTINCT_MEDIA_FRAMES} media frames) · last wake: ${lastWakeReason}`;
    },
    dispose() {
      active = false;
      stop();
    },
  };
}

export function fluidVideoLog(video: HTMLVideoElement, event: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[fluid-video] ${event}`, {
      readyState: video.readyState, videoWidth: video.videoWidth,
      videoHeight: video.videoHeight, currentTime: video.currentTime,
    });
  }
}
