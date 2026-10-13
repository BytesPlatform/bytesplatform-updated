import * as THREE from "three";

/**
 * A paper sheet with rounded corners, drawn on the shared canvas at a DOM
 * section's rect. It lets a section slide over the Work scene while the
 * pointer trail (drawn after it) keeps running across the section.
 */
export function createSheet(hex: number) {
  const uniforms = {
    uViewport: { value: new THREE.Vector2(1, 1) },
    uDpr: { value: 1 },
    // x, y (from the top), width, height in CSS pixels.
    uRect: { value: new THREE.Vector4(0, 0, 0, 0) },
    uRadius: { value: 0 },
    // Raw sRGB, written straight to the screen like the page's own CSS colour
    // (THREE.Color would convert it to linear and the sheet would read darker).
    uColor: { value: new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: `void main(){gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `
      uniform vec2 uViewport; uniform float uDpr; uniform vec4 uRect; uniform float uRadius; uniform vec3 uColor;
      void main(){
        // gl_FragCoord is in device pixels from the bottom; work in CSS px from the top.
        vec2 p=vec2(gl_FragCoord.x/uDpr, uViewport.y-gl_FragCoord.y/uDpr);
        vec2 halfSize=uRect.zw*.5;
        vec2 q=abs(p-(uRect.xy+halfSize))-halfSize+uRadius;
        float d=length(max(q,0.))+min(max(q.x,q.y),0.)-uRadius;
        float a=1.-smoothstep(-.75,.75,d);
        if(a<=0.)discard;
        gl_FragColor=vec4(uColor,a);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.Camera();

  return {
    /** rect is the section's DOMRect; stageTop is the canvas's top in the viewport. */
    render(renderer: THREE.WebGLRenderer, viewport: { w: number; h: number }, rect: DOMRect, stageTop: number, radius: number) {
      if (rect.bottom <= stageTop || rect.top >= stageTop + viewport.h) return;
      uniforms.uViewport.value.set(viewport.w, viewport.h);
      uniforms.uDpr.value = renderer.getPixelRatio();
      uniforms.uRect.value.set(rect.left, rect.top - stageTop, rect.width, rect.height);
      uniforms.uRadius.value = radius;
      renderer.render(scene, camera);
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}
