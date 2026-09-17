import * as THREE from "three";
import { atmosphereLocked, onAtmosphereLock } from "@/lib/atmosphere/lock";

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_beam;
uniform float u_gain;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                           dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv + (u_pointer - 0.5) * 0.04;
  float n = snoise(p * vec2(1.4, 0.35) + vec2(u_time * 0.03, 0.0));
  float sweep = p.x * 1.8 + p.y * 0.6 + n * 0.55 - u_time * 0.07;
  float beam = pow(abs(sin(sweep * 3.14159265)), 12.0) * u_beam;
  beam *= smoothstep(1.15, 0.15, length((p - 0.5) * vec2(1.1, 1.4)));

  vec3 voidc  = vec3(0.012, 0.012, 0.020);
  vec3 blue   = vec3(0.05, 0.18, 0.55);
  vec3 purple = vec3(0.23, 0.04, 0.42);
  vec3 cyan   = vec3(0.00, 0.94, 1.00);

  vec3 col = voidc;
  col = mix(col, purple, beam * 0.45);
  col = mix(col, blue,   beam * 0.65);
  col += cyan * beam * 0.18;
  col *= u_gain + 0.58;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function mountTechnicalHud(root: Element) {
  const node = root.querySelector("canvas.th-canvas");
  if (!(node instanceof HTMLCanvasElement)) return { destroy() {} };
  const canvas = node;
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
    u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
    u_beam: { value: 0.55 },
    u_gain: { value: 0.42 },
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

  const pointer = { x: 0.5, y: 0.5 };
  const onPointer = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / Math.max(r.width, 1);
    pointer.y = 1 - (e.clientY - r.top) / Math.max(r.height, 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const fit = () => {
    const w = Math.max(1, (root as HTMLElement).clientWidth || window.innerWidth);
    const h = Math.max(1, (root as HTMLElement).clientHeight || window.innerHeight);
    renderer.setSize(w, h, false);
    uniforms.u_resolution.value.set(w, h);
  };
  fit();
  window.addEventListener("resize", fit, { passive: true });

  let raf = 0;
  let running = true;
  let t0 = performance.now();

  const tick = (now: number) => {
    if (!running) return;
    if (document.hidden || atmosphereLocked()) {
      raf = 0;
      return;
    }
    const dt = (now - t0) / 1000;
    t0 = now;
    if (!reduce) uniforms.u_time.value += dt;
    uniforms.u_pointer.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.06);
    renderer.render(scene, camera);
    if (reduce) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  const onVis = () => {
    if (document.hidden || atmosphereLocked()) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (running && !reduce && raf === 0) {
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVis);
  const unlock = onAtmosphereLock(onVis);

  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVis);
      unlock();
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
