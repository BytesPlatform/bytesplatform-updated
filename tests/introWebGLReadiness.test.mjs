import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetIntroWebGLReady, markIntroWebGLReady, waitForIntroWebGLReady, isIntroWebGLReady, shouldWaitForIntro, setIntroLoaderWaiting, markIntroWebGLTimeout, introReadinessDebug } from '../src/lib/introWebGLReadiness.ts';

let token;
beforeEach(() => { setIntroLoaderWaiting(false); token = resetIntroWebGLReady(); });

test('wait resolves only after ready, and duplicate completion is harmless', async () => {
  let resolved = false;
  const wait = waitForIntroWebGLReady(new AbortController().signal).then(() => { resolved = true; });
  await Promise.resolve();
  assert.equal(resolved, false);
  markIntroWebGLReady(token);
  await wait;
  assert.equal(resolved, true);
  markIntroWebGLReady(token, true);
  assert.equal(isIntroWebGLReady(), true);
});

test('early readiness is retained for a later loader subscriber', async () => {
  markIntroWebGLReady(token);
  await waitForIntroWebGLReady(new AbortController().signal);
  assert.equal(isIntroWebGLReady(), true);
});

test('reset rejects stale callbacks and pending subscriber survives remount', async () => {
  const wait = waitForIntroWebGLReady(new AbortController().signal);
  const next = resetIntroWebGLReady();
  markIntroWebGLReady(token);
  assert.equal(isIntroWebGLReady(), false);
  markIntroWebGLReady(next);
  await wait;
  assert.equal(isIntroWebGLReady(), true);
});

test('reset clears an already-ready lifecycle', () => {
  markIntroWebGLReady(token);
  resetIntroWebGLReady();
  assert.equal(isIntroWebGLReady(), false);
});

test('unsupported fallback unblocks both current and future subscribers without claiming WebGL success', async () => {
  const wait = waitForIntroWebGLReady(new AbortController().signal);
  markIntroWebGLReady(token, true);
  await wait;
  await waitForIntroWebGLReady(new AbortController().signal);
  assert.equal(isIntroWebGLReady(), false);
});

test('reduced motion and non-home routes never request a WebGL wait', () => {
  assert.equal(shouldWaitForIntro('/', true), false);
  assert.equal(shouldWaitForIntro('/about', false), false);
  assert.equal(shouldWaitForIntro('/', false), true);
});

test('aborted loader wait is cleaned up without marking readiness', async () => {
  const controller = new AbortController();
  const wait = waitForIntroWebGLReady(controller.signal);
  controller.abort();
  await wait;
  assert.equal(isIntroWebGLReady(), false);
});

test('timeout preserves fallback and permits later WebGL success', async () => {
  setIntroLoaderWaiting(true);
  markIntroWebGLTimeout();
  setIntroLoaderWaiting(false);
  assert.equal(isIntroWebGLReady(), false);
  assert.match(introReadinessDebug(), /timeout fallback triggered: yes/);
  markIntroWebGLReady(token);
  await waitForIntroWebGLReady(new AbortController().signal);
  assert.equal(isIntroWebGLReady(), true);
  assert.match(introReadinessDebug(), /timeout fallback triggered: yes/);
});
