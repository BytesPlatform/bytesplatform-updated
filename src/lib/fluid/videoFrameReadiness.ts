/** HTML media readiness alone does not prove that iOS has delivered a frame
 * usable by a GPU texture. Keep one cancellable callback per readiness cycle. */
export function watchVideoFrame(video: HTMLVideoElement, changed: (ready: boolean) => void) {
  let ready = false;
  let active = false;
  let callback: number | null = null;
  let startedAt = 0;
  let initialTime = 0;
  const supportsFrames = typeof video.requestVideoFrameCallback === "function";
  const usable = () => video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
  const cancel = () => {
    if (callback !== null) video.cancelVideoFrameCallback(callback);
    callback = null;
  };
  const confirm = () => {
    if (!active || ready || !usable()) return;
    ready = true;
    cancel();
    fluidVideoLog(video, "decoded frame received");
    changed(true);
  };
  const request = () => {
    if (!active || ready || callback !== null || !supportsFrames) return;
    callback = video.requestVideoFrameCallback(() => {
      callback = null;
      confirm();
    });
  };
  const media = (event: Event) => {
    if (event.type === "loadeddata" || event.type === "canplay") fluidVideoLog(video, event.type);
    if (!supportsFrames) confirm();
    // Some implementations expose rVFC but defer its delivery. Advancing media
    // time after a one-second grace period provides a bounded, event-driven
    // escape; the independent GPU probe still has to succeed before handoff.
    else if (event.type === "timeupdate" && performance.now() - startedAt >= 1000 && video.currentTime !== initialTime) confirm();
    request();
  };
  const reset = () => {
    cancel();
    ready = false;
    changed(false);
  };
  const restart = () => {
    reset();
    active = true;
    startedAt = performance.now();
    initialTime = video.currentTime;
    request();
    if (!supportsFrames) confirm();
  };
  const invalidate = () => { reset(); request(); };
  const events = ["loadeddata", "canplay", "playing", "timeupdate"];
  events.forEach(event => video.addEventListener(event, media));
  video.addEventListener("emptied", invalidate);
  video.addEventListener("seeking", invalidate);
  return {
    restart,
    suspend() { active = false; reset(); },
    dispose() {
      active = false;
      cancel();
      events.forEach(event => video.removeEventListener(event, media));
      video.removeEventListener("emptied", invalidate);
      video.removeEventListener("seeking", invalidate);
    },
  };
}

export function fluidVideoLog(video: HTMLVideoElement, event: string) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[fluid-video] ${event}`, {
      readyState: video.readyState, videoWidth: video.videoWidth,
      videoHeight: video.videoHeight, currentTime: video.currentTime,
    });
  }
}
