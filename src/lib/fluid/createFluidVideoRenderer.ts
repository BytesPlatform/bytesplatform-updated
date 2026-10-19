/**
 * The fluid video pass uses the parent-owned renderer, one plane,
 * one VideoTexture. It knows nothing about scroll or GSAP — the component
 * hands it a progress value and it draws that state.
 *
 * Layout is supplied in shared viewport coordinates. The parent alone sizes
 * the drawing buffer and clears/composites the frame; this pass only draws
 * its sheet and owns the video texture, geometry and material.
 */

import * as THREE from "three";
import { introReadyLog } from "@/lib/introWebGLReadiness";
import { fluidVideoLog } from "./videoFrameReadiness";

import { fluidFragmentShader, fluidVertexShader } from "@/lib/shaders/fluidVideoTransition";
import { cornersAt, sizeOf, type Rect } from "./sheet";

export type FluidVideoRenderer = {
  /** stage size in CSS px, plus where the card and the panel sit in it */
  layout(stage: { w: number; h: number }, from: Rect, to: Rect): void;
  /** draw the transition at progress 0..1 */
  render(progress: number): void;
  /** Offscreen texture + shader verification. Borrowed samples are valid until
   * the next probe; the readiness tracker copies accepted frames. */
  verifyCurrentVideoFrame(): Uint8Array | null;
  prepare(): void;
  /** 0 normal · 1 undistorted · 2 distortion map */
  debugMode: number;
  strength: number;
  /** measured facts, for the debug readout and verification */
  readonly stats: { buffer: [number, number]; css: [number, number]; dpr: number; video: [number, number] };
  dispose(): void;
};

export type FluidVideoOptions = {
  video: HTMLVideoElement;
  segments: [number, number];
  radius: [number, number];
  strength: number;
};

export function createFluidVideoRenderer(
  renderer: THREE.WebGLRenderer,
  opts: FluidVideoOptions,
): FluidVideoRenderer | null {
  const texture = new THREE.VideoTexture(opts.video);
  fluidVideoLog(opts.video, "VideoTexture created");
  // The shader writes the sampled colour straight out, and the renderer adds
  // no output conversion for a ShaderMaterial — so leaving the texture
  // untagged (NoColorSpace) passes the video's sRGB values through unchanged.
  texture.colorSpace = THREE.NoColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const uniforms = {
    uTexture: { value: texture },
    uEnvelope: { value: 0 },
    uTime: { value: 0 },
    uStrength: { value: opts.strength },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uImageResolution: { value: new THREE.Vector2(16, 9) },
    uCanvas: { value: new THREE.Vector2(1, 1) },
    uC0: { value: new THREE.Vector2() },
    uC1: { value: new THREE.Vector2() },
    uC2: { value: new THREE.Vector2() },
    uC3: { value: new THREE.Vector2() },
    uRadius: { value: opts.radius[0] },
    uTintAmount: { value: 0.40 },
    uDebug: { value: 0 },
  };

  const geometry = new THREE.PlaneGeometry(1, 1, opts.segments[0], opts.segments[1]);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: fluidVertexShader,
    fragmentShader: fluidFragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; // the vertex shader writes clip space directly
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.Camera();

  let from: Rect = { x: 0, y: 0, w: 1, h: 1 };
  let to: Rect = { x: 0, y: 0, w: 1, h: 1 };
  const stats: FluidVideoRenderer["stats"] = { buffer: [0, 0], css: [0, 0], dpr: 1, video: [0, 0] };

  const probeTarget = new THREE.WebGLRenderTarget(64, 64, { depthBuffer: false });
  const probeMaterial = new THREE.ShaderMaterial({
    uniforms: { video: { value: texture } },
    vertexShader: "void main() { gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }",
    fragmentShader: "uniform sampler2D video; void main() { gl_FragColor = texture2D(video, gl_FragCoord.xy / 64.0); }",
    depthTest: false, depthWrite: false,
  });
  const pixel = new Uint8Array(4);
  const samples = new Uint8Array(64 * 64 * 4);
  let textureLogged = false;

  const api: FluidVideoRenderer = {
    debugMode: 0,
    strength: opts.strength,
    stats,

    layout(stage, a, b) {
      from = a;
      to = b;
      const dpr = renderer.getPixelRatio();
      uniforms.uCanvas.value.set(stage.w, stage.h);
      stats.css = [stage.w, stage.h];
      stats.buffer = [renderer.domElement.width, renderer.domElement.height];
      stats.dpr = dpr;
    },

    prepare() {
      texture.needsUpdate = true;
      renderer.initTexture(texture);
    },

    verifyCurrentVideoFrame() {
      const gl = renderer.getContext();
      if (gl.isContextLost() || opts.video.readyState < 2 || !opts.video.videoWidth || !opts.video.videoHeight) return null;
      if (stats.css.some(n => n <= 0) || from.w <= 0 || from.h <= 0) return null;
      const savedFrom = from;
      const savedTo = to;
      const savedStage = { w: stats.css[0], h: stats.css[1] };
      const sampleX = Math.floor(probeTarget.width / 2);
      const sampleY = Math.floor(probeTarget.height / 2);
      const target = renderer.getRenderTarget();
      const viewport = renderer.getViewport(new THREE.Vector4());
      const scissorBox = renderer.getScissor(new THREE.Vector4());
      const cubeFace = renderer.getActiveCubeFace();
      const mipLevel = renderer.getActiveMipmapLevel();
      const autoClear = renderer.autoClear;
      const scissor = renderer.getScissorTest();
      try {
        renderer.setScissorTest(false);
        renderer.setRenderTarget(probeTarget);
        renderer.autoClear = true;
        // Force each upload even if Three's own rVFC has been deferred.
        api.prepare();
        mesh.material = probeMaterial;
        renderer.render(scene, camera);
        samples.fill(0);
        renderer.readRenderTargetPixels(probeTarget, 0, 0, 64, 64, samples);
        // Video is opaque, including genuinely black frames. An uninitialized
        // texture cannot pass this alpha check. The caller additionally checks
        // colour progression across distinct media frames.
        if (samples.some((value, index) => index % 4 === 3 && value !== 255) || gl.getError() !== gl.NO_ERROR) return null;
        if (!textureLogged) {
          textureLogged = true;
          introReadyLog("video texture initialized");
        }
        mesh.material = material;
        // The reel is below the viewport at startup. Translate its measured
        // initial card into an offscreen target, retaining its real CSS size,
        // production geometry, shader, radius and progress-zero state.
        const card = { x: 0, y: 0, w: savedFrom.w, h: savedFrom.h };
        api.layout({ w: card.w, h: card.h }, card, card);
        api.render(0);
        pixel.fill(0);
        renderer.readRenderTargetPixels(probeTarget, sampleX, sampleY, 1, 1, pixel);
        return pixel[3] === 255 && gl.getError() === gl.NO_ERROR && !gl.isContextLost() ? samples : null;
      } catch {
        return null;
      } finally {
        mesh.material = material;
        api.layout(savedStage, savedFrom, savedTo);
        renderer.setRenderTarget(target, cubeFace, mipLevel);
        renderer.setViewport(viewport);
        renderer.setScissor(scissorBox);
        renderer.setScissorTest(scissor);
        renderer.autoClear = autoClear;
      }
    },

    render(t) {
      const vw = opts.video.videoWidth;
      const vh = opts.video.videoHeight;
      if (vw && vh) {
        uniforms.uImageResolution.value.set(vw, vh);
        stats.video = [vw, vh];
      }
      const corners = cornersAt(from, to, t);
      uniforms.uC0.value.set(...corners[0]);
      uniforms.uC1.value.set(...corners[1]);
      uniforms.uC2.value.set(...corners[2]);
      uniforms.uC3.value.set(...corners[3]);
      const [w, h] = sizeOf(corners);
      uniforms.uResolution.value.set(Math.max(w, 1), Math.max(h, 1));
      uniforms.uEnvelope.value = Math.sin(Math.PI * t);
      uniforms.uTime.value = t * 3; // progress-derived: frozen when idle
      uniforms.uRadius.value = opts.radius[0] + (opts.radius[1] - opts.radius[0]) * t;
      const tintProgress = Math.min(1, Math.max(0, (t - 0.05) / 0.8));
      uniforms.uTintAmount.value = 0.40 * (1 - tintProgress * tintProgress * (3 - 2 * tintProgress));
      uniforms.uDebug.value = api.debugMode;
      uniforms.uStrength.value = api.strength;
      renderer.render(scene, camera);
    },

    dispose() {
      probeTarget.dispose();
      probeMaterial.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };

  return api;
}
