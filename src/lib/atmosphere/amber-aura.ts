import * as THREE from "three";

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

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
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.015, 0.010, 0.010);

  vec2 glowCenter = mix(vec2(0.5, -0.2), u_mouse, 0.35);
  vec2 pos = st - glowCenter;
  pos.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float breath = 0.92 + 0.08 * sin(u_time * 0.35);
  float n = snoise(vec2(st.x * 2.0, st.y * 2.0 - u_time * 0.10)) * 0.10;
  float dist = length(pos) + n;
  dist *= mix(1.06, 0.94, breath);

  float outerMix = smoothstep(0.95, 0.42, dist);
  float midMix   = smoothstep(0.55, 0.18, dist);
  float coreMix  = smoothstep(0.28, 0.00, dist);

  color = mix(color, vec3(0.133, 0.020, 0.000), outerMix);
  color = mix(color, vec3(0.600, 0.133, 0.000), midMix);
  color = mix(color, vec3(0.976, 0.451, 0.086), coreMix * breath);

  gl_FragColor = vec4(color, 1.0);
}
`;

export function mountAmberAuraBackground(root: Element) {
  const canvas = root.querySelector("canvas.aa-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    root.classList.add("aa-no-webgl");
    return { destroy() {} };
  }

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
    root.classList.add("aa-no-webgl");
    return { destroy() {} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.2) },
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

  const targetMouse = new THREE.Vector2(0.5, 0.2);
  const onPointer = (e: PointerEvent) => {
    targetMouse.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
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
  let last = t0;
  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden && !reduce) {
      uniforms.u_time.value = (now - t0) / 1000;
      // 1.5s settle (~95% in 3τ, τ = 0.5s)
      const alpha = 1 - Math.exp(-dt / 0.5);
      uniforms.u_mouse.value.lerp(targetMouse, alpha);
      renderer.render(scene, camera);
    } else if (!document.hidden && reduce) {
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      mesh.geometry.dispose();
      (mesh.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
    },
  };
}
