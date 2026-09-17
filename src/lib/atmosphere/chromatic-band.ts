import * as THREE from "three";

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_fidelity;
uniform vec2 u_pointer;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);
  p.x += (u_pointer.x - 0.5) * 0.06;

  float a = 0.55;
  float c = cos(a);
  float s = sin(a);
  p = mat2(c, -s, s, c) * p;

  float spread = 0.06 * (0.3 + u_fidelity * 0.7);
  vec3 color = vec3(0.01, 0.01, 0.02);

  for (int i = 0; i < 3; i++) {
    float offset = float(1 - i) * spread;
    float y = p.y + offset
            + sin(p.x * 2.5 - u_time * 0.35) * 0.12
            + cos(p.x * 1.1 + u_time * 0.18) * 0.05;
    float wave = smoothstep(0.85, 0.99, sin(y * 6.0 + u_time * 0.55) * 0.5 + 0.5);
    if (i == 0) color.r += wave;
    if (i == 1) color.g += wave;
    if (i == 2) color.b += wave;
  }

  float vig = 1.0 - smoothstep(0.75, 1.45, length(p));
  color *= mix(0.55, 1.0, vig);
  gl_FragColor = vec4(color, 1.0);
}
`;

export function mountChromaticBandBackground(root: Element) {
  const node = root.querySelector("canvas.cb-canvas");
  if (!(node instanceof HTMLCanvasElement)) return { destroy() {} };
  const canvas: HTMLCanvasElement = node;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch {
    return { destroy() {} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const uniforms = {
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_time: { value: 0 },
    u_fidelity: { value: 0.55 },
    u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    }),
  );
  scene.add(mesh);

  const targetPointer = new THREE.Vector2(0.5, 0.5);
  const onPointer = (e: PointerEvent) => {
    targetPointer.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    renderer.setSize(w, h, false);
    const size = new THREE.Vector2();
    renderer.getDrawingBufferSize(size);
    uniforms.u_resolution.value.copy(size);
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let running = true;
  const t0 = performance.now();

  const tick = (now: number) => {
    if (!running) return;
    if (document.hidden) {
      raf = 0;
      return;
    }
    if (!reduce) {
      uniforms.u_time.value = (now - t0) / 1000;
      uniforms.u_pointer.value.lerp(targetPointer, 0.06);
    }
    renderer.render(scene, camera);
    if (reduce) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (running && !reduce && raf === 0) raf = requestAnimationFrame(tick);
  };
  document.addEventListener("visibilitychange", onVisibility);

  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
