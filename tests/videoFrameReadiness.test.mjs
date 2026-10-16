import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchVideoFrame } from '../src/lib/fluid/videoFrameReadiness.ts';

class Video extends EventTarget {
  readyState = 4;
  videoWidth = 1280;
  videoHeight = 720;
  currentTime = 0;
  callbacks = new Map();
  id = 0;
  requestVideoFrameCallback(cb) { this.callbacks.set(++this.id, cb); return this.id; }
  cancelVideoFrameCallback(id) { this.callbacks.delete(id); }
  frame() {
    const callbacks = [...this.callbacks.values()];
    this.callbacks.clear();
    callbacks.forEach(cb => cb());
  }
}

test('media readiness alone cannot bypass the decoded frame callback', () => {
  const video = new Video();
  const states = [];
  const watcher = watchVideoFrame(video, value => states.push(value));
  watcher.restart();
  for (let i = 0; i < 5; i++) video.dispatchEvent(new Event('canplay'));
  assert.deepEqual(states, [false]);
  assert.equal(video.callbacks.size, 1);
  video.frame();
  assert.deepEqual(states, [false, true]);
  assert.equal(video.callbacks.size, 0);
  watcher.dispose();
});

test('suspend/resume cancels pending work and requires a fresh frame', () => {
  const video = new Video();
  const states = [];
  const watcher = watchVideoFrame(video, value => states.push(value));
  watcher.restart();
  watcher.suspend();
  video.frame();
  assert.equal(states.at(-1), false);
  watcher.restart();
  video.frame();
  assert.equal(states.at(-1), true);
  watcher.restart();
  watcher.dispose();
  assert.equal(video.callbacks.size, 0);
  const count = states.length;
  video.dispatchEvent(new Event('canplay'));
  video.dispatchEvent(new Event('seeking'));
  assert.equal(states.length, count);
});

test('unsupported browsers use media events and reject zero-sized frames', () => {
  const video = new Video();
  video.requestVideoFrameCallback = undefined;
  video.videoWidth = 0;
  const states = [];
  const watcher = watchVideoFrame(video, value => states.push(value));
  watcher.restart();
  video.dispatchEvent(new Event('loadeddata'));
  assert.equal(states.at(-1), false);
  video.videoWidth = 1280;
  video.dispatchEvent(new Event('canplay'));
  assert.equal(states.at(-1), true);
  watcher.dispose();
});

test('stalled callback can recover through advancing playback events', t => {
  const video = new Video();
  const states = [];
  let now = 0;
  t.mock.method(performance, 'now', () => now);
  const watcher = watchVideoFrame(video, value => states.push(value));
  watcher.restart();
  now = 1100;
  video.dispatchEvent(new Event('timeupdate'));
  assert.equal(states.at(-1), false);
  video.currentTime = 0.5;
  video.dispatchEvent(new Event('timeupdate'));
  assert.equal(states.at(-1), true);
  assert.equal(video.callbacks.size, 0);
  watcher.dispose();
});
