/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { atmosphereLocked, onAtmosphereLock } from "@/lib/atmosphere/lock";

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

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
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  uv.x *= aspect;

  vec3 baseColor = vec3(0.01, 0.01, 0.02);
  vec2 st = uv * 0.7;
  st += vec2(
    snoise(st + u_time * 0.05),
    snoise(st - u_time * 0.05)
  ) * 0.3;

  float beam = smoothstep(
    0.1,
    0.8,
    snoise(vec2(st.x + st.y * 1.5 - u_time * 0.15, u_time * 0.02))
  );

  vec3 glow = mix(
    vec3(0.15, 0.25, 0.85),
    vec3(0.4, 0.2, 0.9),
    snoise(uv * 1.5 + u_time * 0.1) * 0.5 + 0.5
  );

  vec2 center = vec2(0.5 * aspect, 0.5);
  float vignette = smoothstep(1.15, 0.35, length(uv - center));

  gl_FragColor = vec4(baseColor + (glow * beam * 0.7) * vignette, 1.0);
}
`;

export function mountNebulaWebglBackground(root = document.querySelector(".nw-root")) {
  if (!root) throw new Error("mountNebulaWebglBackground — missing .nw-root");
  const canvas = root.querySelector("canvas.nw-canvas");
  if (!canvas) throw new Error("mountNebulaWebglBackground — missing canvas.nw-canvas");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch (err) {
    root.classList.add("nw-no-webgl");
    throw err;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    })
  );
  scene.add(mesh);

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
  const tick = (now) => {
    if (!running) return;
    if (document.hidden || atmosphereLocked()) {
      raf = 0;
      return;
    }
    if (!reduce) uniforms.u_time.value = (now - t0) / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  const onVis = () => {
    if (document.hidden || atmosphereLocked()) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (!running) running = true;
    if (raf === 0) raf = requestAnimationFrame(tick);
  };
  document.addEventListener("visibilitychange", onVis);
  const unlock = onAtmosphereLock(onVis);
  raf = requestAnimationFrame(tick);

  return {
    uniforms,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      unlock();
      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
    },
  };
}
