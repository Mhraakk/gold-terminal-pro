import * as THREE from "three";

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
uniform vec2 u_corner;
uniform vec3 u_accent;
uniform float u_count;
uniform float u_a0;
uniform float u_a1;
uniform float u_a2;
uniform float u_core;
uniform float u_glow;
uniform float u_halo;
uniform float u_bloom;
uniform float u_fog;

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

float beamDist(vec2 dlt, vec2 dir) {
  float along = dot(dlt, dir);
  float perp = length(dlt - dir * along);
  float behind = smoothstep(0.0, 0.004, -along);
  return perp + behind * 40.0;
}

void accum(vec2 dlt, float ang, inout float core, inout float glow, inout float halo, inout float energy, float t) {
  vec2 dir = vec2(cos(ang), sin(ang));
  float d = beamDist(dlt, dir);
  float along = max(dot(dlt, dir), 0.0);
  core += exp(-d * u_core);
  glow += exp(-d * u_glow);
  halo += exp(-d * u_halo);
  float travel = 0.5 + 0.5 * sin(along * 28.0 - t * 0.6);
  energy += exp(-d * u_glow) * travel * 0.12;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = uv + (u_pointer - 0.5) * 0.03;
  vec2 dlt = (p - u_corner) * aspect;

  float sumCore = 0.0;
  float sumGlow = 0.0;
  float sumHalo = 0.0;
  float energy = 0.0;

  accum(dlt, u_a0, sumCore, sumGlow, sumHalo, energy, u_time);
  if (u_count > 1.5) accum(dlt, u_a1, sumCore, sumGlow, sumHalo, energy, u_time);
  if (u_count > 2.5) accum(dlt, u_a2, sumCore, sumGlow, sumHalo, energy, u_time);

  float r = length(dlt);
  float bloom = exp(-r * u_bloom);
  float hot = exp(-r * 55.0);
  float cling = max(sumHalo, exp(-r * 3.4));
  float n = fbm(vec2(dlt.x * 6.0, dlt.y * 6.0 - u_time * 0.04));
  float haze = pow(max(n, 0.0), 2.0) * cling * u_fog;
  float breath = 0.84 + 0.16 * sin(u_time * 0.32);

  vec3 color = vec3(0.02);
  color += u_accent * (sumGlow * 0.55 + sumHalo * 0.22 + haze) * breath;
  color += vec3(1.0) * (sumCore + hot * 1.15 + bloom * 0.35 * breath + energy);

  gl_FragColor = vec4(color, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const n = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const v = Number.parseInt(n.slice(0, 6), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function mountCornerLasers(
  root: Element,
  opts: {
    corner?: [number, number];
    count?: 2 | 3;
    angles?: [number, number, number?];
    accent?: string;
  } = {},
) {
  const host = root as HTMLElement;
  const canvas = host.querySelector("canvas.cl-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    root.classList.add("cl-no-webgl");
    return () => {};
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssAccent = getComputedStyle(root).getPropertyValue("--cl-accent").trim();
  const accent = hexToRgb(opts.accent || cssAccent || "#b08948");
  const corner = opts.corner || [0.12, 0.18];
  const count = opts.count === 2 ? 2 : 3;
  const angles = opts.angles || ([0.08, 1.52, 0.72] as [number, number, number]);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch {
    root.classList.add("cl-no-webgl");
    return () => {};
  }

  renderer.setClearColor(0x050505, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const uniforms = {
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_time: { value: 0 },
    u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
    u_corner: { value: new THREE.Vector2(corner[0], corner[1]) },
    u_accent: { value: new THREE.Vector3(accent[0], accent[1], accent[2]) },
    u_count: { value: count },
    u_a0: { value: angles[0] },
    u_a1: { value: angles[1] ?? 1.52 },
    u_a2: { value: angles[2] ?? 0.72 },
    u_core: { value: 3800 },
    u_glow: { value: 26 },
    u_halo: { value: 7 },
    u_bloom: { value: 14 },
    u_fog: { value: 0.28 },
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
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / Math.max(r.width, 1);
    pointer.y = 1 - (e.clientY - r.top) / Math.max(r.height, 1);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.u_resolution.value.set(canvas.width, canvas.height);
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let visible = true;
  const started = performance.now();

  const tick = (now: number) => {
    raf = 0;
    if (document.hidden || !visible) return;
    uniforms.u_time.value = reduce ? 0 : (now - started) / 1000;
    const cur = uniforms.u_pointer.value;
    cur.x += (pointer.x - cur.x) * 0.06;
    cur.y += (pointer.y - cur.y) * 0.06;
    renderer.render(scene, camera);
    if (!reduce) raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!raf && !document.hidden && visible) raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((en) => en.isIntersecting);
    if (visible) start();
    else stop();
  });
  io.observe(canvas);

  const onVis = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener("visibilitychange", onVis);
  start();
  if (reduce) renderer.render(scene, camera);

  return () => {
    stop();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", resize);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    renderer.dispose();
  };
}
