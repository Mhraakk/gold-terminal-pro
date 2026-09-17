import * as THREE from "three";

type Handle = { destroy: () => void };

export function mountTerminalModernism(root: Element): Handle {
  const node = root.querySelector("[data-tm-canvas]") || root.querySelector("canvas");
  if (!(node instanceof HTMLCanvasElement)) return { destroy() {} };
  const canvas = node;
  const labels = [...root.querySelectorAll(".tm-label")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return { destroy() {} };
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const rig = new THREE.Group();
  scene.add(rig);

  const d = 15;
  const camera = new THREE.OrthographicCamera(-d, d, d, -d, 1, 1000);
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  const structural = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.2,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.1,
  });
  const edgeDark = new THREE.LineBasicMaterial({ color: 0x333333 });
  const edgeCyan = new THREE.LineBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.3,
  });

  function edged(geo: THREE.BufferGeometry, material: THREE.Material, lineMat: THREE.LineBasicMaterial) {
    const mesh = new THREE.Mesh(geo, material);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat));
    return mesh;
  }

  rig.add(new THREE.GridHelper(30, 15, 0x333333, 0x1a1a1a));

  const platform = edged(new THREE.BoxGeometry(14, 1.5, 14), structural, edgeDark);
  platform.position.y = 0.75;
  rig.add(platform);

  const pedestal = edged(new THREE.BoxGeometry(6, 1.0, 6), structural, edgeDark);
  pedestal.position.y = 2.0;
  rig.add(pedestal);

  const plinth = edged(new THREE.BoxGeometry(3.2, 0.7, 3.2), structural, edgeDark);
  plinth.position.y = 2.85;
  rig.add(plinth);

  const core = edged(new THREE.BoxGeometry(1.4, 1.4, 1.4), accent, edgeCyan);
  core.position.y = 3.9;
  rig.add(core);

  for (let i = 0; i < 3; i += 1) {
    const radius = 2.2 + i * 0.85;
    const ringGeo = new THREE.CylinderGeometry(radius, radius, 0.06, 12);
    const ring = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), edgeCyan);
    ringGeo.dispose();
    ring.position.y = 3.15 + i * 0.22;
    rig.add(ring);
  }

  const anchors: Record<string, THREE.Vector3> = {
    core: new THREE.Vector3(0, 4.8, 0),
    "node-03": new THREE.Vector3(4.2, 2.6, 1.4),
    uplink: new THREE.Vector3(-4.0, 2.9, -1.6),
  };

  const nodes: THREE.Mesh[] = [];
  const nodeSlots = [
    [4.2, 2.15, 1.4],
    [-4.0, 2.35, -1.6],
    [2.6, 1.9, -3.4],
    [-3.1, 2.05, 3.0],
    [1.1, 3.15, 3.6],
    [-1.4, 2.95, -3.5],
    [5.1, 1.75, -0.7],
    [-5.0, 1.85, 0.5],
  ];
  nodeSlots.forEach((slot, i) => {
    const mat = i % 3 === 0 ? accent : structural;
    const line = i % 3 === 0 ? edgeCyan : edgeDark;
    const node = edged(new THREE.BoxGeometry(0.35, 0.35, 0.35), mat, line);
    node.position.set(slot[0], slot[1], slot[2]);
    node.userData.baseY = slot[1];
    node.userData.speed = 0.6 + (i % 5) * 0.16;
    node.userData.phase = i * 0.7;
    node.userData.amp = 0.12 + (i % 4) * 0.04;
    rig.add(node);
    nodes.push(node);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(0, 24, 0);
  scene.add(key);
  const coreLight = new THREE.PointLight(0x00e5ff, 2.0, 28, 2);
  coreLight.position.set(0, 3.9, 0);
  rig.add(coreLight);

  const clock = new THREE.Clock();
  const proj = new THREE.Vector3();
  let raf = 0;
  let running = true;

  function resize() {
    const width = Math.max(1, (root as HTMLElement).clientWidth || 1);
    const height = Math.max(1, (root as HTMLElement).clientHeight || 1);
    const aspect = width / height;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  }

  function placeLabels() {
    const width = (root as HTMLElement).clientWidth || 1;
    const height = (root as HTMLElement).clientHeight || 1;
    labels.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const key = el.getAttribute("data-anchor");
      const world = key ? anchors[key] : undefined;
      if (!world) return;
      proj.copy(world).applyMatrix4(rig.matrixWorld).project(camera);
      el.style.left = `${(proj.x * 0.5 + 0.5) * width}px`;
      el.style.top = `${(-proj.y * 0.5 + 0.5) * height}px`;
    });
  }

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const time = clock.getElapsedTime();
    if (!reduced) {
      rig.rotation.y = Math.sin(time * 0.1) * 0.12;
      const pulse = (Math.sin(time * Math.PI) + 1) * 0.5;
      accent.emissiveIntensity = 0.3 + pulse * 0.7;
      coreLight.intensity = 1.0 + pulse * 1.0;
      nodes.forEach((n) => {
        const { baseY, speed, phase, amp } = n.userData as {
          baseY: number;
          speed: number;
          phase: number;
          amp: number;
        };
        n.position.y = baseY + Math.sin(time * speed + phase) * amp;
      });
    }
    placeLabels();
    renderer.render(scene, camera);
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (!running) {
      running = true;
      clock.getDelta();
      frame();
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  frame();

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) {
          const mats = Array.isArray(mat) ? mat : [mat];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    },
  };
}
