import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFluidWarmup, watchVideoFrame, REQUIRED_REAL_FLUID_FRAMES, REQUIRED_DISTINCT_MEDIA_FRAMES } from '../src/lib/fluid/videoFrameReadiness.ts';
import { resetIntroWebGLReady, markIntroWebGLReady, markIntroWebGLTimeout, isIntroWebGLReady } from '../src/lib/introWebGLReadiness.ts';

test('warm-up needs 5 real renders across 3 distinct media frames', () => {
  assert.equal(REQUIRED_REAL_FLUID_FRAMES, 5);
  assert.equal(REQUIRED_DISTINCT_MEDIA_FRAMES, 3);
});

test('the same media time does not count as a new media frame', () => {
  const w = createFluidWarmup();
  assert.equal(w.decoded(0.4), true);
  for (const time of [0.4, 0.40001, NaN, -1]) assert.equal(w.decoded(time), false);
  assert.equal(w.state.decodedFrames, 1);
});

test('advancing media times count', () => {
  const w = createFluidWarmup();
  for (const time of [0.033, 0.067, 0.1]) assert.equal(w.decoded(time), true);
  assert.equal(w.state.decodedFrames, 3);
  assert.equal(w.state.mediaTime, 0.1);
});

test('production renders count only once a decoded frame exists', () => {
  const w = createFluidWarmup();
  assert.equal(w.rendered(), false);
  assert.equal(w.state.renders, 0);
  w.decoded(0.033);
  assert.equal(w.rendered(), true);
  assert.equal(w.rendered(), true);
  assert.equal(w.state.renders, 2);
  assert.equal(w.state.renderedFrames, 1); // both renders drew the same frame
});

test('readiness requires both the render count and distinct rendered media frames', () => {
  const w = createFluidWarmup();
  // Sequence from the spec: 1, 2, advance, 3, 4, advance, 5.
  w.decoded(0.033); w.rendered(); w.rendered();
  w.decoded(0.067); w.rendered(); w.rendered();
  assert.equal(w.state.ready, false);
  w.decoded(0.1);
  w.rendered();
  assert.equal(w.state.renders, 5);
  assert.equal(w.state.renderedFrames, 3);
  assert.equal(w.state.ready, true);
});

test('media frames alone never make the pipeline ready', () => {
  const w = createFluidWarmup();
  for (let i = 1; i <= 30; i++) w.decoded(i / 30);
  assert.equal(w.state.ready, false);
  // Decoded frames nobody rendered don't count toward the rendered frames.
  w.rendered();
  assert.equal(w.state.renderedFrames, 1);
  assert.equal(w.state.ready, false);
});

test('render count alone (one still frame) never makes the pipeline ready', () => {
  const w = createFluidWarmup();
  w.decoded(0.033);
  for (let i = 0; i < 50; i++) w.rendered();
  assert.equal(w.state.renders, 50);
  assert.equal(w.state.ready, false);
  w.decoded(0.067); w.rendered();
  assert.equal(w.state.ready, false);
  w.decoded(0.1); w.rendered();
  assert.equal(w.state.ready, true);
});

test('readiness stays latched until an explicit reset', () => {
  const w = createFluidWarmup();
  for (const time of [0.033, 0.067, 0.1, 0.133, 0.167]) { w.decoded(time); w.rendered(); }
  assert.equal(w.state.ready, true);
  assert.equal(w.rendered(), false);
  w.decoded(0.033); // loop back
  assert.equal(w.state.ready, true);
  w.reset();
  assert.deepEqual(w.state, { decodedFrames: 0, mediaTime: -1, renders: 0, renderedFrames: 0, renderedMediaTime: -1, ready: false });
});

class Video extends EventTarget {
  readyState = 4; videoWidth = 1280; videoHeight = 720; currentTime = 0;
  muted = true; playsInline = true; paused = false; ended = false; seeking = false;
  callbacks = new Map(); id = 0; presented = 0; plays = 0;
  play() { this.plays++; return Promise.resolve(); }
  requestVideoFrameCallback(cb) { this.callbacks.set(++this.id, cb); return this.id; }
  cancelVideoFrameCallback(id) { this.callbacks.delete(id); }
  frame(time) {
    this.currentTime = time;
    const callbacks = [...this.callbacks.values()]; this.callbacks.clear();
    callbacks.forEach(cb => cb(0, { mediaTime: time, presentedFrames: ++this.presented }));
  }
}
function setup(t, { rvfc = true } = {}) {
  for (const key of ['document', 'window']) {
    if (!(key in globalThis)) { globalThis[key] = undefined; t.after(() => { delete globalThis[key]; }); }
  }
  const doc = new EventTarget(); doc.hidden = false;
  t.mock.property(globalThis, 'document', doc);
  t.mock.property(globalThis, 'window', new EventTarget());
  const video = new Video();
  if (!rvfc) video.requestVideoFrameCallback = undefined;
  const states = []; const events = [];
  const watcher = watchVideoFrame(video, {
    frame: first => events.push(first ? 'prepare' : 'mark'),
    wake: () => events.push('wake'),
    changed: ready => states.push(ready),
  });
  t.after(() => watcher.dispose());
  watcher.restart();
  /** a decoded frame, then the shared ticker's real render(s) */
  const play = (time, renders = 2) => { video.frame(time); for (let i = 0; i < renders; i++) watcher.rendered(); };
  return { video, watcher, states, events, doc, play };
}

test('watcher: real renders over advancing frames hand off, then stop listening', t => {
  const { video, watcher, states, events, play } = setup(t);
  play(0.033); play(0.067);
  assert.equal(watcher.ready, false);
  play(0.1, 1);
  assert.equal(watcher.ready, true);
  assert.equal(states.at(-1), true);
  assert.deepEqual(events.filter(e => e !== 'wake').slice(0, 2), ['prepare', 'mark']);
  assert.equal(video.callbacks.size, 0);
  const before = events.length;
  window.dispatchEvent(new Event('scroll'));
  assert.equal(events.length, before);
});

test('watcher: renders without decoded progression keep the HTML video up', t => {
  const { video, watcher, states } = setup(t);
  video.frame(0.033);
  for (let i = 0; i < 100; i++) watcher.rendered();
  assert.equal(watcher.ready, false);
  assert.notEqual(states.at(-1), true);
  assert.match(watcher.debug(), /real fluid warmup renders: 100 \(1 media frames\)/);
});

test('watcher: context loss resets warm-up; restoration warms with new real renders', t => {
  const { watcher, states, play } = setup(t);
  play(0.033); play(0.067); play(0.1);
  assert.equal(watcher.ready, true);
  watcher.suspend();
  assert.equal(watcher.ready, false);
  assert.equal(states.at(-1), false);
  watcher.rendered();
  assert.match(watcher.debug(), /real fluid warmup renders: 0/);
  watcher.restart();
  play(0.2); play(0.233);
  assert.equal(watcher.ready, false);
  play(0.267);
  assert.equal(watcher.ready, true);
  assert.equal(states.at(-1), true);
});

test('watcher: loader timeout does not mark WebGL ready, and warm-up completes after it', t => {
  const token = resetIntroWebGLReady();
  const { watcher, play } = setup(t);
  play(0.033);
  markIntroWebGLTimeout();
  assert.equal(isIntroWebGLReady(), false);
  assert.equal(watcher.ready, false);
  play(0.067); play(0.1);
  assert.equal(watcher.ready, true);
  markIntroWebGLReady(token);
  assert.equal(isIntroWebGLReady(), true);
});

test('watcher: wake events nudge playback and texture, hidden pauses frame callbacks', t => {
  const { video, events, doc } = setup(t);
  video.paused = true;
  window.dispatchEvent(new Event('touchstart'));
  assert.ok(events.includes('wake'));
  assert.equal(video.plays, 1);
  doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.callbacks.size, 0);
  doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange'));
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.callbacks.size, 1);
});

test('watcher: without frame callbacks the media clock stands in, still needing real renders', t => {
  const { video, watcher } = setup(t, { rvfc: false });
  for (const time of [0.033, 0.067, 0.1]) {
    video.currentTime = time;
    assert.equal(watcher.ready, false);
    watcher.rendered(); watcher.rendered();
  }
  assert.equal(watcher.ready, true);
});

test('watcher: zero-sized frames are not decoded frames', t => {
  const { video, watcher } = setup(t);
  video.videoWidth = 0;
  video.frame(0.033); watcher.rendered();
  assert.match(watcher.debug(), /media frames seen: 0/);
  assert.match(watcher.debug(), /real fluid warmup renders: 0/);
});
