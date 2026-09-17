import * as THREE from "three";
import { atmosphereLocked, onAtmosphereLock } from "@/lib/atmosphere/lock";

export function mountTerrain(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 7, 14);
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  const geo = new THREE.PlaneGeometry(28, 28, 42, 42);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = Math.sin(x * 0.35) * 0.45 + Math.cos(z * 0.28) * 0.35 + Math.sin((x + z) * 0.18) * 0.2;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  group.add(
    new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x3f3f46, transparent: true, opacity: 1 }),
    ),
  );

  const setSize = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  setSize();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let running = true;
  const t0 = performance.now();

  const tick = (now: number) => {
    if (!running) return;
    if (document.hidden || atmosphereLocked()) {
      raf = 0;
      return;
    }
    const time = (now - t0) / 1000;
    if (!reduce) {
      group.rotation.y = time * 0.04;
      group.position.y = Math.sin(time * 0.15) * 0.12;
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
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    running = true;
    if (!reduce && raf === 0) raf = requestAnimationFrame(tick);
  };

  window.addEventListener("resize", setSize);
  document.addEventListener("visibilitychange", onVisibility);
  const unlock = onAtmosphereLock(onVisibility);

  renderer.render(scene, camera);
  if (!reduce) raf = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", setSize);
    document.removeEventListener("visibilitychange", onVisibility);
    unlock();
    renderer.dispose();
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
  };
}
