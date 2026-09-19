/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { atmosphereLocked, onAtmosphereLock } from "@/lib/atmosphere/lock";

const CNOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  return 2.2 * mix(n_yz.x, n_yz.y, fade_xyz.x);
}
`;

const DISPLACE = /* glsl */ `
float n = cnoise(vec3(position.x * 1.4, position.y * 0.55 + u_time * 0.12, u_time * 0.05));
transformed.z += n * u_amp;
transformed.x += n * u_amp * 0.18;
`;

const GRAIN_FNS = /* glsl */ `
float imRandom(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float imBayer4(vec2 fc) {
  int x = int(mod(fc.x, 4.0));
  int y = int(mod(fc.y, 4.0));
  int index = x + y * 4;
  float m[16];
  m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
  m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
  m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  return m[index] / 16.0;
}
`;

const GRAIN_APPLY = /* glsl */ `
{
  vec2 pix = floor(gl_FragCoord.xy);
  float frame = floor(u_time * 12.0);
  float n = imRandom(pix + vec2(frame, frame * 1.7));
  gl_FragColor.rgb += (n - 0.5) * u_grain;
  gl_FragColor.rgb += (imBayer4(pix) - 0.5) / 255.0;
}
`;

function makeSlabGeometry(width = 0.42, height = 3.4, segY = 48) {
  const geo = new THREE.BufferGeometry();
  const segX = 1;
  const cols = segX + 1;
  const rows = segY + 1;
  const positions = new Float32Array(cols * rows * 3);
  const normals = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  let p = 0;
  let n = 0;
  let u = 0;
  for (let y = 0; y < rows; y++) {
    const vy = (y / segY - 0.5) * height;
    const tv = y / segY;
    for (let x = 0; x < cols; x++) {
      const vx = (x / segX - 0.5) * width;
      positions[p++] = vx;
      positions[p++] = vy;
      positions[p++] = 0;
      normals[n++] = 0;
      normals[n++] = 0;
      normals[n++] = 1;
      uvs[u++] = x / segX;
      uvs[u++] = tv;
    }
  }
  const indices = [];
  for (let y = 0; y < segY; y++) {
    for (let x = 0; x < segX; x++) {
      const a = y * cols + x;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

export function mountIndustrialMinimalism(root = document.querySelector(".im-stage")) {
  if (!root) throw new Error("mountIndustrialMinimalism — missing .im-stage");
  const canvas = root.querySelector("canvas.im-canvas") || root.querySelector("#gl");
  if (!canvas) throw new Error("mountIndustrialMinimalism — missing canvas");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 0.15, 6.2);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  const key = new THREE.DirectionalLight(0xf2f2f6, 0.85);
  key.position.set(-2.2, 3.4, 4.0);
  scene.add(key);

  const uniforms = {
    u_time: { value: 0 },
    u_amp: { value: reduce ? 0.03 : 0.07 },
    u_grain: { value: 0.07 },
    u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
  };

  const mat = new THREE.MeshStandardMaterial({
    color: 0x16161a,
    metalness: 0.3,
    roughness: 0.3,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.u_time = uniforms.u_time;
    shader.uniforms.u_amp = uniforms.u_amp;
    shader.uniforms.u_grain = uniforms.u_grain;
    shader.vertexShader =
      CNOISE +
      shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float u_time;\nuniform float u_amp;",
        )
        .replace("#include <begin_vertex>", "#include <begin_vertex>\n" + DISPLACE);
    shader.fragmentShader =
      GRAIN_FNS +
      shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float u_time;\nuniform float u_grain;",
        )
        .replace(
          "#include <output_fragment>",
          "#include <output_fragment>\n" + GRAIN_APPLY,
        );
  };
  mat.customProgramCacheKey = () => "im-cnoise-0";

  const group = new THREE.Group();
  const count = 9;
  const geometries = [];
  for (let i = 0; i < count; i++) {
    const geo = makeSlabGeometry();
    geometries.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    const t = count === 1 ? 0.5 : i / (count - 1);
    mesh.position.x = -1.8 + t * 3.6;
    mesh.position.z = (t - 0.5) * -0.15;
    group.add(mesh);
  }
  scene.add(group);

  function resize() {
    const w = root.clientWidth || 1;
    const h = root.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  const onPointer = (e) => {
    const rect = root.getBoundingClientRect();
    pointer.tx = (e.clientX - rect.left) / Math.max(rect.width, 1);
    pointer.ty = (e.clientY - rect.top) / Math.max(rect.height, 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let raf = 0;
  let running = true;
  const clock = new THREE.Clock();

  function tick() {
    if (!running) return;
    if (document.hidden || atmosphereLocked()) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
    const t = reduce ? 0 : clock.getElapsedTime();
    uniforms.u_time.value = t;
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    uniforms.u_pointer.value.set(pointer.x, pointer.y);
    if (!reduce) {
      group.position.y = Math.sin(t * 0.28) * 0.045;
      const rx = THREE.MathUtils.clamp((pointer.y - 0.5) * 0.12, -0.06, 0.06);
      const ry = THREE.MathUtils.clamp((pointer.x - 0.5) * 0.12, -0.06, 0.06);
      group.rotation.x += (rx - group.rotation.x) * 0.04;
      group.rotation.y += (ry - group.rotation.y) * 0.04;
    }
    renderer.render(scene, camera);
  }

  const onHidden = () => {
    if (document.hidden || atmosphereLocked()) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!running) {
      running = true;
      clock.getDelta();
      tick();
    }
  };
  document.addEventListener("visibilitychange", onHidden);
  window.addEventListener("resize", resize);
  const unlock = onAtmosphereLock(onHidden);

  if (reduce) {
    renderer.render(scene, camera);
  } else {
    tick();
  }

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onHidden);
      unlock();
      geometries.forEach((g) => g.dispose());
      mat.dispose();
      renderer.dispose();
    },
  };
}
