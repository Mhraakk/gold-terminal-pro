/**
 * Canvas 2D orthographic globe — land as a precomputed point cloud.
 * Deps: d3-geo, topojson-client
 * Land: https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json
 */
import {
  geoBounds,
  geoContains,
  geoGraticule,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export type Dot = { lng: number; lat: number };

export type PointCloudGlobeOptions = {
  canvas: HTMLCanvasElement;
  shell?: HTMLElement;
  land?: Feature<Geometry> | FeatureCollection<Geometry>;
  dots?: Dot[];
  density?: number;
  autoRotate?: boolean;
};

const LAND_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";
const STEP_DEG = 0.5;
const DRAG_GAIN = 0.35;
const RESUME_MS = 1000;
const PHI_MAX = 60;
const DOT_R = 1.2;
const DENSITY = 22;
const SCALE_MIN = 0.55;
const SCALE_MAX = 2.4;

export async function loadLand(): Promise<Feature<Geometry>> {
  const topo = (await fetch(LAND_URL).then((r) => r.json())) as Topology;
  return feature(topo, topo.objects.land) as unknown as Feature<Geometry>;
}

export function generateDots(
  input: Feature<Geometry> | FeatureCollection<Geometry>,
  density = DENSITY,
): Dot[] {
  const features =
    input.type === "FeatureCollection" ? input.features : [input];
  const dots: Dot[] = [];
  const step = density * 0.12;
  for (const feat of features) {
    const bounds = geoBounds(feat);
    let lng0 = bounds[0][0];
    let lng1 = bounds[1][0];
    if (lng1 < lng0) lng1 += 360;
    for (let lng = lng0; lng <= lng1; lng += step) {
      const wrapped = ((((lng + 180) % 360) + 360) % 360) - 180;
      for (let lat = bounds[0][1]; lat <= bounds[1][1]; lat += step) {
        if (geoContains(feat, [wrapped, lat])) {
          dots.push({ lng: wrapped, lat });
        }
      }
    }
  }
  return dots;
}

export function mountPointCloudGlobe(opts: PointCloudGlobeOptions) {
  const canvas = opts.canvas;
  const shell = opts.shell ?? canvas.parentElement;
  const ctx2 = canvas.getContext("2d");
  if (!ctx2) return { destroy() {} };
  const ctx = ctx2;

  const density = opts.density ?? DENSITY;
  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  let auto = opts.autoRotate !== false && !reduced;

  let land = opts.land ?? null;
  let allDots: Dot[] = opts.dots ?? [];
  let lambda = 20;
  let phi = -12;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let resumeAt = 0;
  let raf = 0;
  let width = 0;
  let height = 0;
  let baseScale = 1;
  let userScale = 1;
  let pinch0 = 0;
  let userScale0 = 1;
  let projection: GeoProjection = geoOrthographic();
  const graticule = geoGraticule();
  const path = geoPath(projection, ctx);

  function markReady() {
    shell?.setAttribute("data-ready", "true");
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseScale = Math.min(width, height) / 2 - 8;
    projection = geoOrthographic()
      .scale(baseScale * userScale)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate([lambda, phi, 0]);
    path.projection(projection);
  }

  function render() {
    projection.rotate([lambda, phi, 0]);
    projection.scale(baseScale * userScale);
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    path(graticule());
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ef233c";
    for (let i = 0; i < allDots.length; i++) {
      const p = projection([allDots[i].lng, allDots[i].lat]);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p[0], p[1], DOT_R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick() {
    if (document.hidden || !inView) {
      raf = 0;
      return;
    }
    const now = performance.now();
    if (!dragging && auto && now >= resumeAt) {
      lambda += STEP_DEG;
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  function onDown(e: PointerEvent) {
    dragging = true;
    auto = false;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  }

  function onMove(e: PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    lambda -= dx * DRAG_GAIN;
    phi = Math.max(-PHI_MAX, Math.min(PHI_MAX, phi + dy * DRAG_GAIN));
  }

  function onUp(e: PointerEvent) {
    dragging = false;
    resumeAt = performance.now() + RESUME_MS;
    auto = opts.autoRotate !== false && !reduced;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const next = userScale * Math.pow(1.0015, -e.deltaY);
    userScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, next));
    resumeAt = performance.now() + RESUME_MS;
  }

  function pinchDistance(touches: TouchList) {
    const a = touches[0];
    const b = touches[1];
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      pinch0 = pinchDistance(e.touches);
      userScale0 = userScale;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && pinch0 > 0) {
      e.preventDefault();
      const ratio = pinchDistance(e.touches) / pinch0;
      userScale = Math.max(
        SCALE_MIN,
        Math.min(SCALE_MAX, userScale0 * ratio),
      );
      resumeAt = performance.now() + RESUME_MS;
    }
  }

  const target = shell ?? canvas;
  const ro = new ResizeObserver(resize);
  ro.observe(target);

  let inView = true;
  const io =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          (entries) => {
            inView = entries.some((e) => e.isIntersecting);
            if (inView && !raf && !document.hidden) {
              raf = requestAnimationFrame(tick);
            }
          },
          { threshold: 0 },
        )
      : null;
  if (io && shell) io.observe(shell);

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  target.addEventListener("wheel", onWheel, { passive: false });
  target.addEventListener("touchstart", onTouchStart, { passive: false });
  target.addEventListener("touchmove", onTouchMove, { passive: false });

  const onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  resize();
  raf = requestAnimationFrame(tick);

  if (allDots.length) {
    markReady();
  } else if (land) {
    allDots = generateDots(land, density);
    markReady();
  } else {
    loadLand()
      .then((fc) => {
        land = fc;
        allDots = generateDots(fc, density);
        markReady();
      })
      .catch(() => {
        markReady();
      });
  }

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      target.removeEventListener("wheel", onWheel);
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("visibilitychange", onVis);
    },
    setDots(next: Dot[]) {
      allDots = next;
      markReady();
    },
  };
}
