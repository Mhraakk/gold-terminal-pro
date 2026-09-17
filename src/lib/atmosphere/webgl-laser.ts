import * as THREE from "three";
import { atmosphereLocked, onAtmosphereLock } from "@/lib/atmosphere/lock";

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float x = (uv.x - 0.5) + (u_pointer.x - 0.5) * 0.03;

  float core = exp(-abs(x) * 4000.0);
  float breath = 0.82 + 0.18 * sin(u_time * 0.35);
  float glow = exp(-abs(x) * 28.0) * breath;
  float halo = exp(-abs(x) * 8.0) * 0.22 * breath;

  float n = fbm(vec2(x * 18.0, uv.y * 4.0 - u_time * 0.05));
  float cling = exp(-abs(x) * 10.0);
  float smoke = pow(max(n, 0.0), 2.2) * cling * (0.35 + 0.2 * breath);

  float intensity = glow * 0.85 + halo + smoke;
  float ht = sin(gl_FragCoord.x * 2.5) * sin(gl_FragCoord.y * 2.5);
  float halftone = step(ht * 0.5 + 0.5, intensity * 2.5);

  vec3 field = vec3(0.02);
  vec3 green = vec3(0.133, 0.773, 0.369);
  vec3 white = vec3(1.0);
  vec3 body = mix(field, green, max(halftone, halo * 0.35));
  vec3 color = mix(body, white, core);

  gl_FragColor = vec4(color, 1.0);
}
`;

export function mountWebglLaser(root: Element) {
  const node = root.querySelector("canvas.wll-canvas");
  if (!(node instanceof HTMLCanvasElement)) return { destroy() {} };
  const canvas = node;
  const dots = root.querySelector(".wll-dots");

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

  renderer.setClearColor(0x050505, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const uniforms = {
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_time: { value: 0 },
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
    if (dots instanceof HTMLElement) {
      const dx = (e.clientX / window.innerWidth - 0.5) * 12;
      const dy = (e.clientY / window.innerHeight - 0.5) * 12;
      dots.style.backgroundPosition = `${dx}px ${dy}px`;
    }
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
    if (document.hidden || atmosphereLocked()) {
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
    if (document.hidden || atmosphereLocked()) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (running && !reduce && raf === 0) raf = requestAnimationFrame(tick);
  };
  document.addEventListener("visibilitychange", onVisibility);
  const unlock = onAtmosphereLock(onVisibility);

  canvas.classList.add("is-live");
  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      unlock();
      canvas.classList.remove("is-live");
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
