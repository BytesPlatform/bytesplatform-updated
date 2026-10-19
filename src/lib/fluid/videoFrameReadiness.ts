export const REQUIRED_GPU_VIDEO_FRAMES = 3;
const MEDIA_EPSILON = 0.0001;

/** Pixel progression is deliberately conservative: identical/static pictures
 * cannot prove a new upload, even when the media clock is advancing. */
export function createVideoFrameProgress() {
  let pixels: Uint8Array | null = null;
  const state = {
    decodedFrames: 0, decodedMediaTime: -1,
    verifiedFrames: 0, verifiedMediaTime: -1, ready: false,
  };
  return {
    state,
    reset() {
      pixels = null;
      Object.assign(state, { decodedFrames: 0, decodedMediaTime: -1, verifiedFrames: 0, verifiedMediaTime: -1, ready: false });
    },
    decoded(time: number) {
      if (!Number.isFinite(time) || time <= state.decodedMediaTime + MEDIA_EPSILON) return false;
      state.decodedMediaTime = time;
      state.decodedFrames++;
      return true;
    },
    verify(time: number, sample: Uint8Array | null) {
      if (state.ready || !sample || time !== state.decodedMediaTime || time <= state.verifiedMediaTime + MEDIA_EPSILON) return false;
      if (pixels && sample.length === pixels.length && sample.every((value, i) => value === pixels![i])) return false;
      pixels = sample.slice();
      state.verifiedMediaTime = time;
      state.verifiedFrames++;
      state.ready = state.verifiedFrames >= REQUIRED_GPU_VIDEO_FRAMES;
      return true;
    },
  };
}

/** One temporary RAF and one rVFC per lifecycle; no loader deadline owns this
 * controller. A hidden document suspends it; context loss resets it. */
export function watchVideoFrame(
  video: HTMLVideoElement,
  probe: () => Uint8Array | null,
  changed: (ready: boolean) => void,
) {
  const progress = createVideoFrameProgress();
  let active = false;
  let raf: number | null = null;
  let callback: number | null = null;
  let listening = false;
  let lastPlay = -Infinity;
  let playPending = false;
  let lastProgress = 0;
  let lastRecovery = 0;
  let lastDecodedLog = -Infinity;
  let lastDecodedAt = -Infinity;
  let lastFrameCallback = 0;
  let presentedFrames = -1;
  let lastWakeReason = 'initial';
  const supportsFrames = typeof video.requestVideoFrameCallback === 'function';
  const usable = () => video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !video.seeking;
  const cancel = () => {
    if (raf !== null) cancelAnimationFrame(raf);
    if (callback !== null) video.cancelVideoFrameCallback(callback);
    raf = callback = null;
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
    // A loop/seek starts a new sequence rather than counting backwards.
    if (time < progress.state.decodedMediaTime - MEDIA_EPSILON) {
      progress.reset();
      lastProgress = performance.now();
    }
    if (progress.decoded(time)) {
      lastDecodedAt = performance.now();
      if (lastDecodedAt - lastDecodedLog >= 250) {
        lastDecodedLog = lastDecodedAt;
        fluidVideoLog(video, `decoded frame mediaTime=${time.toFixed(3)}`);
      }
    }
  };
  const attempt = () => {
    if (!active || document.hidden || progress.state.ready) return;
    recoverPlay();
    if (!usable()) return;
    // Prefer rVFC metadata. If absent/deferred, a media clock plus CHANGING
    // GPU pixels is required; clock ticks alone never establish readiness.
    if (!supportsFrames || performance.now() - lastFrameCallback >= 1000) decoded(video.currentTime);
    const sample = probe(); // Force uploads even between decoded callbacks.
    const { decodedMediaTime } = progress.state;
    if (decodedMediaTime >= 0 && progress.verify(decodedMediaTime, sample)) {
      lastProgress = performance.now();
      fluidVideoLog(video, `GPU frame verified mediaTime=${decodedMediaTime.toFixed(3)} count=${progress.state.verifiedFrames}`);
    }
    if (progress.state.ready) {
      cancel();
      listen(false);
      fluidVideoLog(video, 'continuous VideoTexture ready');
      changed(true);
    } else if (progress.state.decodedMediaTime > progress.state.verifiedMediaTime && performance.now() - lastDecodedAt < 750 && performance.now() - lastProgress >= 750 && performance.now() - lastRecovery >= 1000) {
      lastRecovery = performance.now();
      fluidVideoLog(video, 'decoded video advancing but GPU verification stalled');
      // The single scheduled RAF performs the next forced init/upload/probe.
      // No extra loop or texture allocation is needed for recovery.
      lastWakeReason = 'recovery';
    }
  };
  const schedule = () => {
    if (!active || document.hidden || progress.state.ready || raf !== null) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      attempt();
      schedule();
    });
  };
  const requestFrame = () => {
    if (!active || document.hidden || progress.state.ready || callback !== null || !supportsFrames) return;
    callback = video.requestVideoFrameCallback((_now, metadata) => {
      callback = null;
      lastFrameCallback = performance.now();
      if (usable() && metadata.presentedFrames !== presentedFrames) {
        presentedFrames = metadata.presentedFrames;
        decoded(metadata.mediaTime);
        lastWakeReason = 'video-frame';
        attempt();
      }
      requestFrame();
    });
  };
  const wake = (event?: Event) => {
    if (!active || progress.state.ready) return;
    lastWakeReason = event?.type === 'touchstart' ? 'touch' : event?.type === 'pointerdown' ? 'pointer' : event?.type === 'visibilitychange' ? 'visibility' : event?.type ?? 'initial';
    if (document.hidden) { cancel(); return; }
    recoverPlay();
    requestFrame();
    schedule();
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
  const restart = () => {
    cancel();
    progress.reset();
    presentedFrames = -1;
    lastFrameCallback = lastProgress = performance.now();
    lastRecovery = 0;
    active = true;
    changed(false);
    listen(true);
    wake();
  };
  const invalidate = () => { if (active) restart(); };
  video.addEventListener('emptied', invalidate);
  video.addEventListener('seeking', invalidate);
  return {
    restart,
    suspend() { active = false; cancel(); listen(false); progress.reset(); changed(false); },
    debug() {
      const s = progress.state;
      return `decoded frames: ${s.decodedFrames} · decoded mediaTime: ${s.decodedMediaTime.toFixed(3)} · GPU verified frames: ${s.verifiedFrames} · last GPU mediaTime: ${s.verifiedMediaTime.toFixed(3)} · VideoTexture continuous ready: ${s.ready ? 'yes' : 'no'} · warm-up RAF: ${raf !== null ? 'running' : 'stopped'} · last wake reason: ${lastWakeReason}`;
    },
    dispose() {
      active = false;
      cancel();
      listen(false);
      video.removeEventListener('emptied', invalidate);
      video.removeEventListener('seeking', invalidate);
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
