import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVideoFrameProgress, watchVideoFrame } from '../src/lib/fluid/videoFrameReadiness.ts';
import { resetIntroWebGLReady, markIntroWebGLReady, markIntroWebGLTimeout, isIntroWebGLReady } from '../src/lib/introWebGLReadiness.ts';
const sample = n => new Uint8Array([n, 0, 0, 255]);

test('same or backwards mediaTime cannot count as advancing frames', () => {
  const p = createVideoFrameProgress();
  p.decoded(0.4);
  assert.equal(p.verify(0.4, sample(1)), true);
  for (const time of [0.4, 0.400001, 0.3]) {
    assert.equal(p.decoded(time), false);
    assert.equal(p.verify(time, sample(2)), false);
  }
  assert.equal(p.state.verifiedFrames, 1);
});

test('three advancing timestamps AND changing GPU pixels are required', () => {
  const p = createVideoFrameProgress();
  p.decoded(0.4); p.verify(0.4, sample(1));
  p.decoded(0.44);
  assert.equal(p.verify(0.44, sample(1)), false);
  assert.equal(p.verify(0.44, null), false);
  assert.equal(p.verify(0.44, sample(2)), true);
  assert.equal(p.state.ready, false);
  p.decoded(0.48); p.verify(0.48, sample(3));
  assert.equal(p.state.ready, true);
  p.reset();
  assert.deepEqual(p.state, { decodedFrames: 0, decodedMediaTime: -1, verifiedFrames: 0, verifiedMediaTime: -1, ready: false });
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
function setup(t, probe) {
  for (const key of ["document", "window", "requestAnimationFrame", "cancelAnimationFrame"]) {
    if (!(key in globalThis)) { globalThis[key] = undefined; t.after(() => { delete globalThis[key]; }); }
  }
  const rafs = new Map(); let id = 0;
  const doc = new EventTarget(); doc.hidden = false;
  t.mock.property(globalThis, 'document', doc);
  t.mock.property(globalThis, 'window', new EventTarget());
  t.mock.property(globalThis, 'requestAnimationFrame', cb => { rafs.set(++id, cb); return id; });
  t.mock.property(globalThis, 'cancelAnimationFrame', id => rafs.delete(id));
  const video = new Video(); const states = [];
  const watcher = watchVideoFrame(video, probe ?? (() => sample(video.currentTime * 100)), ready => states.push(ready));
  t.after(() => watcher.dispose());
  const tick = () => { const pending = [...rafs.values()]; rafs.clear(); pending.forEach(cb => cb()); };
  watcher.restart();
  return { video, watcher, states, rafs, doc, tick };
}

test('wake events coalesce, readiness stops probes/listeners, dispose cancels work', t => {
  const { video, watcher, rafs, tick, states } = setup(t);
  for (let i = 0; i < 5; i++) for (const event of ['scroll', 'pointerdown', 'touchstart']) window.dispatchEvent(new Event(event));
  assert.equal(rafs.size, 1); assert.equal(video.callbacks.size, 1);
  tick(); assert.equal(rafs.size, 1);
  video.frame(0.4); video.frame(0.44); video.frame(0.48);
  assert.equal(states.at(-1), true);
  assert.equal(rafs.size, 0); assert.equal(video.callbacks.size, 0);
  window.dispatchEvent(new Event('scroll')); assert.equal(rafs.size, 0);
  watcher.restart(); watcher.dispose();
  assert.equal(rafs.size, 0); assert.equal(video.callbacks.size, 0);
});

test('context-loss suspend clears readiness and restoration requires three new frames', t => {
  const { video, watcher, states, rafs } = setup(t);
  video.frame(0.4); video.frame(0.44); video.frame(0.48);
  watcher.suspend();
  assert.equal(states.at(-1), false); assert.equal(rafs.size, 0);
  assert.match(watcher.debug(), /GPU verified frames: 0/);
  watcher.restart();
  video.frame(0.6); video.frame(0.64); assert.equal(states.at(-1), false);
  video.frame(0.68); assert.equal(states.at(-1), true);
});

test('hidden document cancels both callbacks and resumes one loop', t => {
  const { video, doc, rafs } = setup(t);
  doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(rafs.size, 0); assert.equal(video.callbacks.size, 0);
  doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange'));
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(rafs.size, 1); assert.equal(video.callbacks.size, 1);
});

test('loader timeout never claims readiness or stops later GPU verification', t => {
  const token = resetIntroWebGLReady();
  const { video, rafs, states } = setup(t);
  video.frame(0.4);
  markIntroWebGLTimeout();
  assert.equal(isIntroWebGLReady(), false); assert.equal(states.at(-1), false);
  assert.equal(rafs.size, 1);
  video.frame(0.44); video.frame(0.48);
  assert.equal(states.at(-1), true);
  markIntroWebGLReady(token); assert.equal(isIntroWebGLReady(), true);
});

test('fallback clock and advancing media cannot pass stale GPU samples; play is throttled', t => {
  let now = 0; t.mock.method(performance, 'now', () => now);
  const { video, tick, watcher, states } = setup(t, () => sample(1));
  video.paused = true;
  for (let i = 1; i < 10; i++) { now = 1100 + i; video.currentTime = i / 10; tick(); }
  assert.equal(states.at(-1), false);
  assert.match(watcher.debug(), /GPU verified frames: 1/);
  assert.equal(video.plays, 1);
});

test('loaded media events and repeated RAFs cannot replace decoded frame advancement', t => {
  let pixels = 0;
  const { video, tick, states, watcher } = setup(t, () => sample(++pixels));
  video.dispatchEvent(new Event('canplay'));
  for (let i = 0; i < 5; i++) tick();
  assert.equal(states.at(-1), false);
  assert.match(watcher.debug(), /GPU verified frames: 0/);
  video.frame(0.4);
  for (let i = 0; i < 5; i++) tick();
  assert.match(watcher.debug(), /GPU verified frames: 1/);
});

test('zero-sized decoded frames are rejected, and seeking invalidates progress', t => {
  const { video, states, watcher } = setup(t);
  video.videoWidth = 0; video.frame(0.4);
  assert.match(watcher.debug(), /GPU verified frames: 0/);
  video.videoWidth = 1280; video.frame(0.44); video.frame(0.48);
  assert.match(watcher.debug(), /GPU verified frames: 2/);
  video.dispatchEvent(new Event('seeking'));
  assert.equal(states.at(-1), false);
  assert.match(watcher.debug(), /GPU verified frames: 0/);
});
