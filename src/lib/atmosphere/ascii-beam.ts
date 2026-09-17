const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+/=?@_|~";
const NODE_COUNT = 90;
const BEAM_COUNT = 24;
const NODE_RADIUS = 120;
const MOUSE_RADIUS = 180;
const LINK_W = 0.5;
const FONT_PX = 12;
const DPR_CAP = 2;
const FONT =
  FONT_PX + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  char: string;
};

type Beam = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
};

function pickChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!;
}

export function mountAsciiBeam(root: Element | null) {
  if (!root) return () => {};

  const nodeEl = root.querySelector(".ab-canvas");
  if (!(nodeEl instanceof HTMLCanvasElement)) return () => {};
  const canvas: HTMLCanvasElement = nodeEl;

  const ctxMaybe = canvas.getContext("2d", { alpha: false });
  if (!ctxMaybe) return () => {};
  const ctx: CanvasRenderingContext2D = ctxMaybe;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const surface = root.getAttribute("data-ab-mode") === "surface";

  let width = 0;
  let height = 0;
  let nodes: Node[] = [];
  let beams: Beam[] = [];
  let raf = 0;
  let running = false;
  let inView = true;
  let lastW = 0;
  let lastH = 0;
  const mouse = { x: 0, y: 0, on: false };

  function seed(w: number, h: number) {
    const nextNodes: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nextNodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: 0.1 + Math.random() * 0.4,
        z: Math.random(),
        char: pickChar(),
      });
    }
    const nextBeams: Beam[] = [];
    for (let i = 0; i < BEAM_COUNT; i++) {
      nextBeams.push({
        x: Math.random() * w,
        y: Math.random() * h,
        length: 80 + Math.random() * 160,
        speed: 3 + Math.random() * 6,
        opacity: 0.18 + Math.random() * 0.35,
      });
    }
    nodes = nextNodes;
    beams = nextBeams;
    lastW = w;
    lastH = h;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    width = w;
    height = h;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = FONT;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    if (!nodes.length || Math.abs(w - lastW) > 80 || Math.abs(h - lastH) > 80) {
      seed(w, h);
    }
  }

  function wrapNode(n: Node) {
    if (n.x < -12) n.x = width + 12;
    else if (n.x > width + 12) n.x = -12;
    if (n.y < -12) n.y = height + 12;
    else if (n.y > height + 12) n.y = -12;
  }

  function draw() {
    ctx.fillStyle = "#030509";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < beams.length; i++) {
      const b = beams[i]!;
      if (!reduce) {
        b.y -= b.speed;
        if (b.y + b.length < 0) {
          b.y = height + 40 + Math.random() * 80;
          b.x = Math.random() * width;
        }
      }
      const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.length);
      g.addColorStop(0, "rgba(96, 165, 250, " + b.opacity + ")");
      g.addColorStop(1, "rgba(96, 165, 250, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + b.length);
      ctx.stroke();
    }

    ctx.lineWidth = LINK_W;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d >= NODE_RADIUS || d === 0) continue;
        ctx.strokeStyle = "rgba(96, 165, 250, " + 0.18 * (1 - d / NODE_RADIUS) + ")";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!;
      if (!reduce) {
        n.x += n.vx;
        n.y += n.vy;
        wrapNode(n);
      }

      let dist = Infinity;
      if (mouse.on) dist = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      const near = dist < MOUSE_RADIUS;

      if (!reduce) {
        const roll = Math.random();
        if (near ? roll > 0.72 : roll > 0.98) n.char = pickChar();
      }

      if (near) {
        ctx.strokeStyle = "rgba(96, 165, 250, " + (1 - dist / MOUSE_RADIUS) * 0.55 + ")";
        ctx.lineWidth = LINK_W;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = FONT;
      } else {
        const far = 0.22 + n.z * 0.28;
        ctx.fillStyle = "rgba(156, 163, 175, " + far + ")";
        const px = Math.round(11 + n.z * 2);
        ctx.font =
          px +
          'px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
      }

      ctx.fillText(n.char, n.x, n.y);
    }
  }

  function tick() {
    if (!running) return;
    draw();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || document.hidden || reduce || !inView) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  function onIntersect(entries: IntersectionObserverEntry[]) {
    inView = entries.some((e) => e.isIntersecting);
    if (inView) start();
    else stop();
  }

  function onMove(e: Event) {
    const p = e as PointerEvent;
    mouse.x = p.clientX;
    mouse.y = p.clientY;
    mouse.on = true;
  }

  function onLeave() {
    mouse.on = false;
  }

  const moveTarget: EventTarget = surface ? canvas : window;

  resize();
  draw();
  if (!reduce) start();

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  moveTarget.addEventListener("pointermove", onMove, { passive: true });
  moveTarget.addEventListener("pointerleave", onLeave, { passive: true });
  if (!surface) window.addEventListener("blur", onLeave);

  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(onIntersect, { threshold: 0.01 });
    io.observe(canvas);
  }

  return function destroy() {
    stop();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    moveTarget.removeEventListener("pointermove", onMove);
    moveTarget.removeEventListener("pointerleave", onLeave);
    if (!surface) window.removeEventListener("blur", onLeave);
    if (io) io.disconnect();
  };
}
