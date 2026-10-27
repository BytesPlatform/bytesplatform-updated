import * as THREE from 'three';
import { createPearlTrail } from '../intro/pearlTrail';

/**
 * The site's pearl cursor trail over an open case study. The case study is a
 * modal dialog in the browser's top layer, above the shared canvas the trail
 * normally draws on, so it gets its own transparent canvas inside the dialog.
 * There is no scene to refract there, so only the liquid's tinted folds show.
 * The canvas and its WebGL context are made once and reused; stop() pauses
 * the loop and takes the canvas out while no case study is open.
 */
export function createCaseTrail(dialog) {
  const canvas = document.createElement('canvas');
  canvas.className = 'case-trail';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setClearColor(0x000000, 0);
  // A clear backdrop: the trail's refraction term drops out.
  const backdrop = new THREE.DataTexture(new Uint8Array(4), 1, 1);
  backdrop.needsUpdate = true;
  const trail = createPearlTrail(renderer, backdrop);
  const pointer = { x: 0, y: 0, has: false };
  const events = new AbortController();
  let frame = 0;
  let last = 0;
  let width = 1;
  let height = 1;
  dialog.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.has = true;
  }, { passive: true, signal: events.signal });
  dialog.addEventListener('pointerleave', () => { pointer.has = false; }, { signal: events.signal });
  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  }
  window.addEventListener('resize', () => { if (frame) resize(); }, { signal: events.signal });
  function tick(now) {
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    trail.update(dt, pointer.x, pointer.y, pointer.has, width, height);
    renderer.setRenderTarget(null);
    renderer.clear();
    trail.render();
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer.has = false;
    canvas.remove();
  }
  return {
    start() {
      if (frame) return;
      resize();
      dialog.append(canvas);
      last = performance.now();
      frame = requestAnimationFrame(tick);
    },
    stop,
    dispose() {
      stop();
      events.abort();
      trail.dispose();
      backdrop.dispose();
      renderer.dispose();
    },
  };
}
