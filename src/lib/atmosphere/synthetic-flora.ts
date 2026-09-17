import * as THREE from "three";
import { atmosphereLocked, onAtmosphereLock } from "@/lib/atmosphere/lock";

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
${NOISE}
void main() {
  float t = uTime * 0.10;
  float noise = snoise(vec3(
    position.x * uNoiseFreq + t,
    position.y * uNoiseFreq,
    position.z * uNoiseFreq
  ));
  vec3 newPosition = position + normal * (noise * uNoiseAmp);
  vec4 mv = modelViewMatrix * vec4(newPosition, 1.0);
  vPosition = mv.xyz;
  vNormal = normalize(normalMatrix * normal);
  vNoise = noise;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float uColorShift;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec3 n = normalize(vNormal);
  float fresnel = pow(1.0 - clamp(dot(normalize(-vPosition), n), 0.0, 1.0), 2.5);
  float colorFactor = uColorShift + fresnel + vNoise * 0.12;
  vec3 baseColor = palette(
    colorFactor,
    vec3(0.1, 0.4, 0.3),
    vec3(0.2, 0.5, 0.4),
    vec3(1.0),
    vec3(0.0, 0.33, 0.67)
  );
  vec3 color = mix(vec3(0.01), baseColor, clamp(fresnel * 1.2, 0.0, 1.0));
  gl_FragColor = vec4(color, 0.70);
}
`;

const DESKTOP_X = 2.0;
const MOBILE_BREAK = 768;

export function mountSyntheticFloraBackground(root: Element) {
  const node = root.querySelector("canvas.sf-canvas");
  if (!(node instanceof HTMLCanvasElement)) return { destroy() {} };
  const canvas = node;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return { destroy() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x020202, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020202);
  scene.fog = new THREE.Fog(0x020202, 3, 10);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
  camera.position.z = 5;

  const uniforms = {
    uTime: { value: 0 },
    uNoiseFreq: { value: 1.5 },
    uNoiseAmp: { value: 0.2 },
    uColorShift: { value: 0 },
  };

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 128, 128),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  );
  scene.add(mesh);

  const targetPointer = new THREE.Vector2(0, 0);
  const pointer = new THREE.Vector2(0, 0);
  const onPointer = (e: PointerEvent) => {
    targetPointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const compositionX = () => (window.innerWidth >= MOBILE_BREAK ? DESKTOP_X : 0);

  const resize = () => {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    mesh.position.x = compositionX();
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
    const seconds = (now - t0) / 1000;
    const scrollUnit = window.scrollY / Math.max(window.innerHeight, 1);
    if (!reduce) {
      uniforms.uTime.value = seconds;
      pointer.lerp(targetPointer, 0.06);
      mesh.position.x = compositionX();
      mesh.position.y = Math.sin(seconds * 0.3) * 0.08;
      mesh.position.z = -Math.min(scrollUnit * 0.35, 0.6);
      mesh.rotation.y = pointer.x * 0.18;
      mesh.rotation.x = pointer.y * 0.12 + Math.min(scrollUnit * 0.12, 0.25);
    }
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
    if (running && !reduce && raf === 0) raf = requestAnimationFrame(tick);
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
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      unlock();
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
